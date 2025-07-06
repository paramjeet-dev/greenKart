import { useState, useEffect } from "react";
import { FaMapMarkedAlt, FaList, FaFilter, FaClock, FaUtensils, FaMapMarkerAlt, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

export default function ExploreListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list");
  const [filterCategory, setFilterCategory] = useState("All");
  const [userLocation, setUserLocation] = useState(null); // User location
  const [mapLoaded, setMapLoaded] = useState(false); // Map loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch listings from backend
    const fetchListings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/listings`);
        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }
        const data = await response.json();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();

    // Get user's current position and set it as map center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]); // Set user location
          setMapLoaded(true); // Set map as loaded
        },
        (error) => {
          console.error("Error getting user location:", error);
          setUserLocation([20.5937, 78.9629]); // Fallback to a default location (India center)
          setMapLoaded(true);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation([20.5937, 78.9629]); // Fallback location if geolocation is not available
      setMapLoaded(true);
    }
  }, []);

  const filteredListings = listings.filter((listing) => {
    const filterExpired = listing.status == "active"; // check if the status is not expired
    const isCategoryMatch = filterCategory === "All" || listing.category === filterCategory; // check if category matches or is 'All'
    return filterExpired && isCategoryMatch; // both conditions must be true
  });
  


  // Helper for category styling
  const categoryColors = {
    Vegetables: "bg-green-100 text-green-700",
    Bakery: "bg-yellow-100 text-yellow-700",
    Cooked: "bg-red-100 text-red-700"
  };

  const handleClick = (listing) => {
    navigate(`/details/${listing._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-6 flex items-center gap-2 text-green-700 hover:text-green-900 transition"
        >
          <FaArrowLeft />
          <span className="font-medium">Back</span>
        </button>

        <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Explore Food Listings</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition ${view === "list" ? "bg-green-600 text-white" : "bg-green-100 text-green-800"}`}
          >
            <FaList /> List
          </button>
          <button
            onClick={() => setView("map")}
            className={`px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition ${view === "map" ? "bg-green-600 text-white" : "bg-green-100 text-green-800"}`}
          >
            <FaMapMarkedAlt /> Map
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-green-700" />
          <select
            className="px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-300"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Bakery">Bakery</option>
            <option value="Cooked">Cooked</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-green-700">
          <p>Loading listings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-700">
          <p>Error: {error}</p>
        </div>
      )}

      {/* List View */}
      {!loading && !error && view === "list" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <motion.div
              key={listing.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all border border-green-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold text-green-800 mb-2">{listing.title}</h2>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${categoryColors[listing.category]}`}>
                {listing.category}
              </span>
              <p className="text-gray-600 flex items-center gap-2 text-sm mb-1">
                <FaClock /> <span>Expires on {new Date(listing.expiryDate).toLocaleDateString("en-IN")}</span>
              </p>
              <p className="text-gray-600 flex items-center gap-2 text-sm mb-1">
                <FaMapMarkerAlt /> <span>{listing.location.city}</span>
              </p>
              <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition" onClick={() => handleClick(listing)}>
                View Details
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Map View */}
      {!loading && !error && view === "map" && userLocation && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
          {!mapLoaded && (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex items-center justify-center">
              <div className="spinner-border text-green-500" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}

          <MapContainer center={userLocation} zoom={10} style={{ width: "100%", height: "400px" }} whenCreated={(map) => setMapLoaded(true)} className="rounded-md">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredListings.map((listing) => (
              <Marker
                key={listing.id}
                position={[listing.location.coordinates.lat, listing.location.coordinates.lon]}
              >
                <Popup>
                  <div>
                    <h3>{listing.title}</h3>
                    <p>{listing.location.city}</p>
                    <button onClick={() => handleClick(listing)} className="text-green-600">View Details</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
