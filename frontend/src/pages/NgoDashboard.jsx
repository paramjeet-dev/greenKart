import { useState, useEffect } from "react";
import {
  FaLeaf,
  FaUserCircle,
  FaClock,
  FaCheckCircle,
  FaFileAlt,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`);

export default function NgoDashboard() {
  const [showMenu, setShowMenu] = useState(false);
  const [nearbyFood, setNearbyFood] = useState([]);
  const [pickupHistory, setPickupHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [reviewsMap, setReviewsMap] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [room, setRoom] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [donor, setDonor] = useState(null)
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleInfoClick = (food) => {
    navigate(`/details/${food._id}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const foodResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings/`);
        const historyResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/ngo/listings/${user.id}`
        );

        const foodData = await foodResponse.json();
        const historyData = await historyResponse.json();
        setNearbyFood(foodData);
        setPickupHistory(historyData);

        // ✅ Fetch reviews only after pickupHistory is ready
        const picked = historyData.filter(p => p.status === "picked");
        const reviewsObj = {};

        await Promise.all(picked.map(async (item) => {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/reviews/${item._id}`);
          const data = await res.json();
          if (data && data._id) {
            reviewsObj[item._id] = data;
          }
        }));

        setReviewsMap(reviewsObj);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user.id]);


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
      receiver: donor,
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

  const handleOpenChat = async (donor) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !donor) return alert("User or donor info missing.");
    setShowChat(true);
    setLoadingChat(true);
    setDonor(donor)

    try {
      const existingChat = await fetch(`${import.meta.env.VITE_BACKEND_URLL}/chat/${user.id}`);
      const existingData = await existingChat.json();
      let roomId = null;
      if (existingData.length === 0) {
        roomId = (await createNewRoom(user.id, donor))._id;
      } else {
        const roomArray = existingData.filter((data) => data.user === donor);
        if (roomArray.length === 0) {
          roomId = (await createNewRoom(user.id, donor))._id;
        } else {
          roomId = roomArray[0]._id;
        }
      }

      setRoom(roomId);
      joinRoom(roomId);

      // ✅ Now call the history endpoint with a valid roomId
      const historyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/history/${roomId}`);
      const history = await historyRes.json();
      setChatMessages(Array.isArray(history) ? history : []);
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

  const claimedHistory = pickupHistory.filter((item) => item.status === "claimed");
  const pickedHistory = pickupHistory.filter((item) => item.status === "picked");
  const expiredHistory = pickupHistory.filter((item) => item.status === "expired");

  const handleClaim = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.id;

    if (!userId || !selectedListing) {
      alert("User not logged in or listing not selected.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/listings/${selectedListing._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claimedBy: userId,
            status: "claimed"
          }),
        }
      );

      if (response.ok) {
        setShowClaimModal(false);
        setSelectedListing(null);
        const updatedFoodResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings/`);
        const updatedFoodData = await updatedFoodResponse.json();
        setNearbyFood(updatedFoodData);
        toast.success("Item claimed successfully!");
      } else {
        const error = await response.json();
        alert("Error: " + error.message);
      }
    } catch (err) {
      console.error("Claim error:", err);
      alert("Failed to claim. Try again.");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        const foodRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ngo/listings/${user.id}`);
        const foodData = await foodRes.json();
        setPickupHistory(foodData);
        toast.success(`Status updated to ${newStatus}`);
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", claimedBy: null }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const historyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ngo/listings/${user.id}`);
      const history = await historyRes.json();
      setPickupHistory(history);
      toast.success("Claim canceled – back to active");
    } catch (err) {
      toast.error("Unable to cancel");
      console.error(err);
    }
  };

  const handlePickup = (id) => updateStatus(id, "picked");

  const submitReview = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const ngoId = userData?.id;
    if (rating === 0 || !currentReviewId) {
      toast.error("Rating required.");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: currentReviewId,
          ngoId,
          rating,
          comment: reviewText || "No comment"
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Review failed");
      }
      const newReview = await res.json();
      setReviewsMap((prev) => ({ ...prev, [currentReviewId]: newReview }));
      toast.success("Thanks for your feedback!");
      setReviewModal(false);
      setRating(0);
      setReviewText("");
      setCurrentReviewId(null);
    } catch (err) {
      toast.error(err.message);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-green-100 p-8 font-sans">
      {/* Header */}
      <ToastContainer />
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3 text-green-800 text-3xl font-extrabold tracking-tight">
          <FaLeaf className="text-green-600" /> GreenKart NGO
        </div>
        <div className="relative">
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer text-green-800 hover:text-green-600 transition"
          >
            <FaUserCircle className="text-4xl" />
          </div>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 border"
            >
              <button
                onClick={() => handleLogout()}
                className="flex items-center gap-2 px-4 py-2 w-full text-green-800 hover:bg-green-100"
              >
                <FaSignOutAlt /> Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Nearby Available Food */}
          <section>
            <h2 className="text-xl font-bold text-green-800 mb-4">
              Nearby Available Food
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {!loading && nearbyFood.length > 0 ? (
                nearbyFood.filter((food) => food.status == "active")
                  .slice(0, 3).map((food) => (
                    <div
                      key={food._id}
                      className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                    >
                      <div className="text-lg font-semibold text-green-900 mb-2">
                        {food.title}
                      </div>
                      <div className="text-sm text-gray-700 flex items-center gap-2 mb-1">
                        <FaMapMarkerAlt /> {food.location?.city}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mb-4">
                        <FaClock /> Expires in:{" "}
                        {new Date(food.expiryDate).toLocaleDateString("en-IN")}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInfoClick(food)}
                          className="flex items-center gap-2 border border-green-600 text-green-700 bg-white px-3 py-2 rounded-md hover:bg-green-50 transition"
                        >
                          <FaInfoCircle className="text-green-600" />
                          Info
                        </button>
                        <button
                          disabled={!!food.claimedBy}
                          onClick={() => {
                            setSelectedListing(food);
                            setShowClaimModal(true);
                          }}
                          className={`flex-1 px-4 py-2 rounded-md transition ${food.claimedBy
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                        >
                          Claim Food
                        </button>
                      </div>
                    </div>
                  ))
              ) : loading ? (
                <p className="text-gray-500">Loading nearby food...</p>
              ) : (
                <div className="flex justify-center items-center bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg shadow-md">
                  <p className="font-semibold">No food available nearby.</p>
                </div>
              )}
            </div>
            {!loading && nearbyFood.length > 3 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/listings")}
                  className="text-green-700 border border-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition"
                >
                  Show More
                </button>
              </div>
            )}
          </section>

          {/* Pickup History */}
          <section className="py-6 max-w-screen-lg">
            <h2 className="text-2xl font-semibold text-green-800 mb-6">Pickup History</h2>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Claimed */}
              <div className="bg-white p-4 rounded-xl shadow-md min-h-[200px] flex flex-col md:w-[60%]">
                <h3 className="text-lg font-medium text-green-700 mb-3">Claimed</h3>
                {claimedHistory.length > 0 ? (
                  <div className="space-y-4 flex-grow">
                    {claimedHistory.map(p => (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-green-900">{p.title}</div>
                          <div className="text-sm text-gray-600">{p.location.city}</div>
                          <div className="text-sm text-gray-500">
                            Expires: {new Date(p.expiryDate).toLocaleDateString("en-IN")}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                          <button
                            onClick={() => handleCancel(p._id)}
                            className="px-4 py-1 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handlePickup(p._id)}
                            className="px-4 py-1 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                          >
                            Mark Picked
                          </button>
                          <button
                            onClick={()=>handleOpenChat(p.userId)}
                            className="px-4 py-1 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Chat
                          </button>
                        </div>
                      </div>

                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 flex justify-center items-center">No claimed items.</div>
                )}
              </div>

              {/* Picked */}
              <div className="bg-white p-4 rounded-xl shadow-md min-h-[200px] flex flex-col md:w-[40%]">
                <h3 className="text-lg font-medium text-blue-700 mb-3">Picked</h3>
                {pickedHistory.length > 0 ? (
                  <div className="space-y-4 flex-grow">
                    {pickedHistory.map(p => (
                      <div key={p._id} className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-green-900">{p.title}</div>
                          <div className="text-sm text-gray-600">{p.location.city}</div>
                          <div className="text-sm text-gray-500">Picked on: {new Date(p.expiryDate).toLocaleDateString("en-IN")}</div>
                        </div>

                        {reviewsMap[p._id] ? (
                          <div className="text-yellow-400 text-xl">
                            {"★".repeat(reviewsMap[p._id].rating)}{"☆".repeat(5 - reviewsMap[p._id].rating)}
                          </div>
                        ) : (
                          
                          <button
                            onClick={() => {
                              setReviewModal(true);
                              setCurrentReviewId(p._id);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            Leave Review
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-auto">No picked items.</div>
                )}
              </div>
            </div>

            {/* Expired */}
            {expiredHistory.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-md min-h-[200px] flex flex-col mt-8">
                <h3 className="text-lg font-medium text-yellow-700 mb-3">Expired</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {expiredHistory.map(p => (
                    // <div key={p._id} className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 shadow">
                    <div key={p._id} className="bg-yellow-50 p-4 rounded-lg border border-blue-200">
                      <div className="font-semibold text-green-900">{p.title}</div>
                      <div className="text-sm text-gray-600">{p.location.city}</div>
                      <div className="text-sm text-gray-500">Expired: {new Date(p.expiryDate).toLocaleDateString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>


        {/* Right Column: NGO Profile */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-green-800 mb-4">NGO Profile</h2>
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <FaUserCircle className="text-4xl text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                    Helping Hands Foundation
                    <FaCheckCircle className="text-green-500" title="Verified" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    Registered NGO working across Delhi NCR. Verified by GreenKart.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <FaFileAlt /> Documents Uploaded
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Claim Modal */}
      {
        showClaimModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
              <h2 className="text-2xl font-bold text-green-800">Confirm Claim</h2>
              <p className="text-gray-700">
                Are you sure you want to claim <strong>{selectedListing.item}</strong>?
              </p>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setSelectedListing(null);
                  }}
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
        )
      }

      {
        reviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-green-800 mb-4">Your Feedback</h2>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i}
                    onClick={() => setRating(i)}
                    className={`text-4xl ${rating >= i ? "text-yellow-400" : "text-gray-300"} transition`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows={3}
                placeholder="(Optional) Add comments..."
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setReviewModal(false); setRating(0); setCurrentReviewId(null); }}
                  className="text-gray-600 hover:text-gray-800">
                  Skip
                </button>
                <button onClick={submitReview}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  Submit
                </button>
              </div>
            </div>
          </div>
        )
      }

      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                  {"Chat with Donor"}
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
    </div >
  );
}
