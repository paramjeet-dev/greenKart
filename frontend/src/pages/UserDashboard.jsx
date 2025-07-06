import { useState, useEffect } from "react";
import {
  FaBox, FaCalendarAlt, FaChartPie, FaLeaf, FaUserCircle,
  FaSignOutAlt, FaCog, FaBell, FaPlus, FaEnvelope, FaStar, FaTimes
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { useForm } from "react-hook-form";
import { useUser } from "../../context/UserContext";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`);

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function Dashboard() {
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [users, setusers] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviews, setReviews] = useState([]);
  const { user, logout } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [room, setRoom] = useState('')
  const [newMessage, setNewMessage] = useState("")
  const [chatThreads, setChatThreads] = useState([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchListings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings/user/${user.id}`);
        const data = await response.json();
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      } finally {
        setLoadingListings(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/user/` + user.id);
        const data = await response.json();
        setChatThreads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setChatThreads([]);
      } finally {
        setLoadingMessages(false);
      }
    };


    const fetchReviews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/reviews/user/${user.id}`);
        const data = await response.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching user reviews:", error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchListings();
    fetchMessages();
    fetchReviews();
  }, [user]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatMessages((prev) =>
        data.room === selectedChat ? [...prev, data] : prev
      );
      setChatThreads((prev) => [...prev, data]);
    });
    return () => socket.off("receive_message");
  }, [selectedChat]);


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

  useEffect(() => {
    if (chatThreads.length === 0) return;

    const fetchUsers = async () => {
      try {
        const userIds = chatThreads
          .map(msg => msg.sender)
          .filter((value, index, self) => self.indexOf(value) === index);

        const userPromises = userIds.map(userId =>
          fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`).then(res => res.json())
        );
        const usersData = await Promise.all(userPromises);

        const usersMap = usersData.reduce((acc, user) => {
          acc[user._id] = user;
          return acc;
        }, {});

        setusers(usersMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [chatThreads]);

  const handleChatClick = async (chatId) => {
    setRoom(chatId);
    joinRoom(chatId);
    setSelectedChat(chatId);
    try {
      const historyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/history/${chatId}`);
      const history = await historyRes.json();
      setChatMessages(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };


  const closeChat = () => {
    setRoom("");
    setSelectedChat(null);
  }

  const handleModalSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", data.imageFile[0]);
      formData.append("upload_preset", "greenkart");

      const cloudinaryRes = await fetch(
        "https://api.cloudinary.com/v1_1/dfnhnrfbk/image/upload",
        { method: "POST", body: formData }
      );
      const cloudinaryData = await cloudinaryRes.json();
      const imageUrl = cloudinaryData.secure_url;

      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { latitude, longitude } = position.coords;

      const locationRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const locationData = await locationRes.json();
      const city =
        locationData.address.city ||
        locationData.address.town ||
        locationData.address.village ||
        locationData.address.county ||
        "Unknown";

      const listingPayload = {
        userId: user.id,
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        quantity: parseInt(data.quantity),
        imgUrl: imageUrl,
        expiryDate: data.expiryDate,
        location: {
          coordinates: { lat: latitude, lon: longitude },
          city,
        },
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload),
      });

      if (!response.ok) {
        toast.error("Failed to create listing. Please try again.");
      } else {
        toast.success("Listing successfully created!");
        reset();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to submit listing:", error);
      toast.error("Could not submit listing. Check your internet or location permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const chartData = {
    labels: ['Active', 'Claimed', 'Picked', 'Expired'],
    datasets: [
      {
        label: 'My Listings',
        data: [
          listings.filter(item => item.status === "active").length,
          listings.filter(item => item.status === "claimed").length,
          listings.filter(item => item.status === "picked").length,
          listings.filter(item => item.status === "expired").length,
        ],
        backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545'],
        borderColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545'],
        borderWidth: 1,
      },
    ],
  };


  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'My Listings Distribution',
      },
    },
  };


  const Spinner = () => (
    <div className="flex justify-center py-8">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ✅ Deduplicate messages by chat ID or sender and pick the latest message only
  const dedupedThreads = Object.values(chatThreads.reduce((acc, msg) => {
    const key = msg.room || msg.sender;
    if (!acc[key] || new Date(msg.updatedAt) > new Date(acc[key].updatedAt)) {
      acc[key] = msg;
    }
    return acc;
  }, {}));
  const uniqueChatList = Object.values(dedupedThreads);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-green-100 font-sans relative">
      <div className="bg-white px-6 py-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 text-green-800 text-2xl font-bold">
          <FaLeaf /> GreenKart
        </div>
        <div className="flex gap-3 items-center">
          <motion.button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <FaPlus /> Add Listing
          </motion.button>
          <div className="relative">
            <div
              onClick={() => setShowMenu(!showMenu)}
              className="cursor-pointer text-green-800 hover:text-green-600 transition"
            >
              <FaUserCircle className="text-3xl" />
            </div>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg z-50 overflow-hidden border"
              >
                <button className="flex items-center gap-2 px-4 py-2 text-green-800 hover:bg-green-100 w-full">
                  <FaCog /> Settings
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-green-800 hover:bg-green-100 w-full">
                  <FaBell /> Notifications
                </button>
                <button onClick={() => handleLogout()} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full">
                  <FaSignOutAlt /> Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[{
            icon: <FaBox className="text-4xl text-white" />, title: "Active Donations", value: listings.filter(item => item.status === "active").length, bg: "bg-green-500"
          }, {
            icon: <FaCalendarAlt className="text-4xl text-white" />, title: "Upcoming Pickups", value: listings.filter(item => item.status === "claimed").length, bg: "bg-green-600"
          }, {
            icon: <FaChartPie className="text-4xl text-white" />, title: "Meals Donated", value: listings.length, bg: "bg-green-700"
          }].map((stat, i) => (
            <motion.div
              key={i}
              className={`rounded-2xl p-6 text-white shadow-xl ${stat.bg} relative overflow-hidden transform hover:scale-105 transition-all`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute right-4 top-4 opacity-10 scale-150">{stat.icon}</div>
              <p className="text-md font-medium mb-1">{stat.title}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-xl col-span-1">
            <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2"><FaBox /> My Listings</h2>
            {loadingListings ? (
              <Spinner />
            ) : listings.length > 0 ? (
              <Pie data={chartData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-10">No listings available to display chart.</p>
            )}
          </div>

          {/* ✅ Updated Inbox */}
          <div className="bg-white p-6 rounded-2xl shadow-xl col-span-1">
            <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2"><FaEnvelope /> Inbox</h2>
            {loadingMessages ? (
              <Spinner />
            ) : uniqueChatList.length > 0 ? (
              <ul className="space-y-4 text-sm text-gray-800">
                {uniqueChatList.map(msg => (
                  <li key={msg._id} onClick={() => handleChatClick(msg.room)} className="cursor-pointer p-3 rounded-md hover:bg-green-50 flex items-center gap-3">
                    <FaUserCircle className="text-green-500 text-2xl" />
                    <div className="flex-1">
                      {console.log(uniqueChatList)}
                      {console.log(users)}
                      <p className="font-semibold">{users[msg.sender]?.name || "Unknown User"}</p>
                      <p className="truncate max-w-xs">{msg.message}</p>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(msg.updatedAt || msg.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No messages to show.</p>
            )}
          </div>

          {/* ✅ Reviews Section */}
          <div className="bg-white p-6 rounded-2xl shadow-xl col-span-1">
            <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2"><FaStar /> Reviews</h2>
            {loadingReviews ? (
              <Spinner />
            ) : reviews.length > 0 ? (
              <ul className="space-y-4 text-sm text-gray-800 max-h-80 overflow-y-auto">
                {reviews.map((review, index) => (
                  <li key={index} className="border-b pb-3">
                    {console.log(review)}
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-green-700">
                        {review.ngoId?.name || 'NGO'}
                      </p>
                      <span className="text-yellow-500">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm italic mb-1">
                      For: {review.listingId?.title || 'Listing'}
                    </p>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No reviews yet.</p>
            )}
          </div>


        </div>

        {/* Chat modal */}
        {selectedChat && (
          <div className="bg-white p-6 rounded-2xl shadow-xl lg:col-span-1 fixed bottom-4 right-4 max-w-md w-full z-50 flex flex-col">
            <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
              <FaStar />
              Chat
              <button
                onClick={() => setSelectedChat(null)}
                className="ml-auto text-gray-500 hover:text-gray-800"
              >
                <FaTimes className="text-xl" />
              </button>
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto flex flex-col">
              {chatMessages !== null ? (
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
        )}


      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <motion.div
            className="bg-white p-6 rounded-3xl shadow-2xl w-96"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-xl font-bold text-green-800 mb-4">Add New Listing</h3>
            <form onSubmit={handleSubmit(handleModalSubmit)} className="space-y-4">
              <div>
                <input {...register("title", { required: "Title is required" })} placeholder="Title" className="w-full px-4 py-2 border rounded-lg shadow-sm" />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <textarea {...register("description", { required: "Description is required" })} placeholder="Description" className="w-full px-4 py-2 border rounded-lg shadow-sm" />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <input type="number" {...register("price", { required: "Price is required", min: 0 })} placeholder="Price" className="w-full px-4 py-2 border rounded-lg shadow-sm" />
                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <input {...register("category", { required: "Category is required" })} placeholder="Category" className="w-full px-4 py-2 border rounded-lg shadow-sm" />
                {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <input type="number" {...register("quantity", { required: "Quantity is required", min: 1 })} placeholder="Quantity" className="w-full px-4 py-2 border rounded-lg shadow-sm" />
                {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity.message}</p>}
              </div>
              <div>
                <input type="file" accept="image/*" {...register("imageFile", { required: "Image is required" })} className="w-full px-4 py-2 border rounded-lg shadow-sm" />
                {errors.imageFile && <p className="text-red-600 text-sm mt-1">{errors.imageFile.message}</p>}
              </div>
              <div>
                <input type="date" {...register("expiryDate", {
                  required: "Expiry date is required",
                  validate: value => value >= today || "Date cannot be in the past"
                })} min={today} className="w-full px-4 py-2 border rounded-lg shadow-sm" />
                {errors.expiryDate && <p className="text-red-600 text-sm mt-1">{errors.expiryDate.message}</p>}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-60" disabled={isSubmitting}>
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )
      }

      <ToastContainer position="bottom-right" />
    </div>
  );
}

