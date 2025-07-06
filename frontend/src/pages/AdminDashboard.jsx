import { useState } from "react";
import { FaUsers, FaBoxOpen, FaCheckCircle, FaChartBar, FaTrashAlt, FaUserShield } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");

  const renderContent = () => {
    switch (tab) {
      case "users":
        return <UserManagement />;
      case "listings":
        return <ListingModeration />;
      case "verification":
        return <NGOVerification />;
      case "analytics":
        return <DataAnalytics />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-green-100 p-6 md:p-10">
      <h1 className="text-4xl font-bold text-green-800 mb-8 flex items-center gap-3">
        <FaUserShield /> Admin Dashboard
      </h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={() => setTab("users")} className={`px-6 py-3 rounded-xl shadow-md font-semibold ${tab === "users" ? "bg-green-600 text-white" : "bg-white text-green-800"}`}>User Management</button>
        <button onClick={() => setTab("listings")} className={`px-6 py-3 rounded-xl shadow-md font-semibold ${tab === "listings" ? "bg-green-600 text-white" : "bg-white text-green-800"}`}>Listings Moderation</button>
        <button onClick={() => setTab("verification")} className={`px-6 py-3 rounded-xl shadow-md font-semibold ${tab === "verification" ? "bg-green-600 text-white" : "bg-white text-green-800"}`}>NGO Verification</button>
        <button onClick={() => setTab("analytics")} className={`px-6 py-3 rounded-xl shadow-md font-semibold ${tab === "analytics" ? "bg-green-600 text-white" : "bg-white text-green-800"}`}>Analytics</button>
      </div>

      {renderContent()}
    </div>
  );
}

function UserManagement() {
  const users = [
    { id: 1, name: "John Doe", role: "Donor" },
    { id: 2, name: "Hope Foundation", role: "NGO" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Users & NGOs</h2>
      <ul className="divide-y divide-gray-200">
        {users.map(user => (
          <li key={user.id} className="py-3 flex justify-between">
            <span>{user.name} - <span className="italic">{user.role}</span></span>
            <button className="text-red-600 hover:text-red-800 flex items-center gap-1"><FaTrashAlt /> Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListingModeration() {
  const listings = [
    { id: 1, item: "Rice Bags", user: "ShelterConnect" },
    { id: 2, item: "Canned Beans", user: "John Doe" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Moderate Listings</h2>
      <ul className="divide-y divide-gray-200">
        {listings.map(l => (
          <li key={l.id} className="py-3 flex justify-between">
            <span>{l.item} listed by {l.user}</span>
            <div className="flex gap-3">
              <button className="text-green-600 hover:text-green-800">Approve</button>
              <button className="text-red-600 hover:text-red-800">Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NGOVerification() {
  const ngos = [
    { id: 1, name: "HelpNow", status: "Pending" },
    { id: 2, name: "GoodHands", status: "Pending" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800">NGO Verification Requests</h2>
      <ul className="divide-y divide-gray-200">
        {ngos.map(ngo => (
          <li key={ngo.id} className="py-3 flex justify-between">
            <span>{ngo.name} - {ngo.status}</span>
            <div className="flex gap-3">
              <button className="text-green-600 hover:text-green-800">Verify</button>
              <button className="text-red-600 hover:text-red-800">Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataAnalytics() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center gap-2"><FaChartBar /> Platform Analytics</h2>
      <p className="text-gray-700">Analytics graphs and charts will go here...</p>
    </div>
  );
}
