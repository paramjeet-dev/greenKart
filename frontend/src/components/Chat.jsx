// components/Chat.js
import { useState, useEffect } from 'react';
import { FaComments } from 'react-icons/fa';

export default function Chat({ listingId, donor, userId, onClose }) {
  const [chatId, setChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    if (!listingId || !donor || !userId) return;

    const initiateChat = async () => {
      setLoadingChat(true);

      try {
        const res = await fetch("`${process.env.BACKEND_URL}`/chat/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            donorId: donor._id,
            listingId,
          }),
        });

        const data = await res.json();
        setChatId(data._id);
        setChatMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to initiate chat", err);
        alert("Unable to load chat.");
      } finally {
        setLoadingChat(false);
      }
    };

    initiateChat();
  }, [listingId, donor, userId]);

  useEffect(() => {
    if (!chatId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(``${process.env.BACKEND_URL}`/chat/${chatId}`);
        const data = await res.json();
        setChatMessages(data.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageToSend = newMessage.trim();
    setNewMessage(""); // Clear the input

    const optimisticMessage = {
      senderId: userId,
      message: messageToSend,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, optimisticMessage]);

    try {
      await fetch(``${process.env.BACKEND_URL}`/chat/${chatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          message: messageToSend,
        }),
      });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Chat with {donor?.name || "Donor"}</h2>
          <button onClick={onClose} className="text-white text-xl">×</button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 flex flex-col">
          {loadingChat ? (
            <p className="text-gray-500 text-sm text-center">Loading chat...</p>
          ) : (
            chatMessages.map((msg, idx) => {
              const isUser = msg.senderId === userId;
              return (
                <div
                  key={idx}
                  className={`text-sm px-4 py-2 rounded-lg max-w-[80%] ${isUser ? "bg-gray-200 self-end" : "bg-green-100 self-start"}`}
                >
                  {msg.message}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t flex p-3 items-center gap-2">
          <input
            type="text"
            className="flex-1 border px-4 py-2 rounded-md focus:outline-none"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
  );
}
