import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaClock,
  FaUserAlt,
  FaMapMarkerAlt,
  FaComments,
  FaHandHoldingHeart,
  FaArrowLeft,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`);

export default function ListingDetails() {
  const [countdown, setCountdown] = useState(0);
  const [listing, setListing] = useState(null);
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [room, setRoom] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings/${id}`);
        const data = await response.json();
        setListing(data);

        const timeLeft = Math.max(
          0,
          Math.floor((new Date(data.expiryDate) - new Date()) / 1000)
        );
        setCountdown(timeLeft);

        if (data.userId) {
          const userResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${data.userId}`);
          const userData = await userResponse.json();
          setDonor(userData);
        }

        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData?.id;
        if (data.claimedBy) {
          setIsClaimed(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatMessages((prev) => [...prev, data]);
    });
    return () => socket.off("receive_message");
  }, []);

  const joinRoom = (roomId) => {
    socket.emit("join_room", roomId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const user = JSON.parse(localStorage.getItem("user"));
    const msgData = {
      room,
      message: newMessage,
      sender: user.id,
      receiver: donor._id,
      time: new Date().toLocaleTimeString(),
    };
    socket.emit("send_message", msgData);
    setChatMessages((prev) => [...prev, msgData]);
    setNewMessage("");

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgData),
      });
    } catch (err) {
      console.error("Failed to save message", err);
    }
  };

  const handleOpenChat = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !donor || !listing?._id) return alert("User or donor info missing.");
    setShowChat(true);
    setLoadingChat(true);
  
    try {
      const existingChat = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/${user.id}`);
      const existingData = await existingChat.json();
  
      let roomId = null;
      if (existingData.length === 0) {
        roomId = (await createNewRoom(user.id, donor._id))._id;
      } else {
        const roomArray = existingData.filter((data) => data.user === donor._id);
        if (roomArray.length === 0) {
          roomId = (await createNewRoom(user.id, donor._id))._id;
        } else {
          roomId = roomArray[0]._id;
        }
      }
  
      setRoom(roomId);
      joinRoom(roomId);
      console.log(room)
  
      // ✅ Now call the history endpoint with a valid roomId
      const historyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/history/${roomId}`);
      const history = await historyRes.json();
      setChatMessages(Array.isArray(history) ? history : []);
      console.log(chatMessages)
    } catch (err) {
      console.error("Failed to initiate chat", err);
      alert("Unable to load chat.");
    } finally {
      setLoadingChat(false);
    }
  };
  

  const createNewRoom = async (ngo, user) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ngo: ngo, user: user }),
    });
    return await res.json();
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hrs}h ${mins}m ${secs}s`;
  };

  const handleClaim = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.id;

    if (!userId) {
      alert("User not logged in.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings/${listing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimedBy: userId, status: "claimed" })
      });

      if (response.ok) {
        setIsClaimed(true);
        setShowClaimModal(false);
      } else {
        const error = await response.json();
        alert("Error: " + error.message);
      }
    } catch (err) {
      console.error("Claim error:", err);
      alert("Failed to claim. Try again.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!listing) return <div className="p-6 text-red-600">Listing not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl p-6 md:p-10 relative">

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-6 flex items-center gap-2 text-green-700 hover:text-green-900 transition mb-1"
        >
          <FaArrowLeft />
          <span className="font-medium">Back</span>
        </button>

        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6 mt-4 shadow-lg">
          <img
            src={listing.imgUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-4">{listing.title}</h1>
            <p className="text-lg text-gray-700 mb-2">
              Quantity: <span className="font-semibold">{listing.quantity}</span>
            </p>
            <p className="text-lg text-gray-700 mb-2 flex items-center gap-2">
              <FaClock className="text-green-600" /> Expires in:{" "}
              <span className="font-semibold">{formatTime(countdown)}</span>
            </p>
            <p className="text-lg text-gray-700 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-600" /> {listing.location?.city}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClaimModal(true)}
                disabled={isClaimed}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-md transition ${isClaimed
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                <FaHandHoldingHeart /> {isClaimed ? "Already Claimed" : "Claim Now"}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenChat}
                className="flex items-center gap-2 border border-green-600 text-green-700 px-6 py-3 rounded-lg hover:bg-green-50 transition"
              >
                <FaComments /> Chat with Donor
              </motion.button>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-6 shadow-inner">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Donor Info</h2>
            <p className="text-lg text-gray-700 flex items-center gap-2 mb-2">
              <FaUserAlt className="text-green-700" /> {donor?.name || "Anonymous"}
            </p>
            <p className="text-sm text-green-700 font-medium">
              {donor?.status === "active" ? "Verified Donor" : "Unverified"}
            </p>
            <p className="text-sm text-gray-500 mt-2 italic">
              {isClaimed
                ? donor.address.city + "," + donor.address.state
                : "Exact address shared upon confirmation"}
            </p>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-green-800">Confirm Claim</h2>
            <p className="text-gray-700">
              Are you sure you want to claim <strong>{listing.title}</strong>?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClaim}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </div>
      )}


      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Chat with {donor?.name || "Donor"}
              </h2>
              <button
                onClick={() => setShowChat(false)}
                className="text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 flex flex-col">
              {loadingChat ? (
                <p className="text-gray-500 text-sm text-center">Loading chat...</p>
              ) : chatMessages.length != 0 ? (
                chatMessages.map((msg, idx) => {
                  const isUser =
                    msg.sender === JSON.parse(localStorage.getItem("user"))?.id;
                  return (
                    <div
                      key={idx}
                      className={`text-sm px-4 py-2 rounded-lg max-w-[80%] ${isUser
                        ? "bg-green-400 self-start"
                        : "bg-gray-400 self-end"
                        }`}
                    >
                      {msg.message}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm text-center">No messages yet</p>
              )}
            </div>

            {/* Input Section */}
            <div className="border-t flex p-3 items-center gap-2">
              <input
                type="text"
                className="flex-1 border px-4 py-2 rounded-md focus:outline-none"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
