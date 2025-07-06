import { FaLeaf, FaHandshake, FaMapMarkerAlt, FaChartPie } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-green-100 to-green-300 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-md py-6 px-10 flex items-center justify-between">
        <div className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <FaLeaf /> GreenKart
        </div>
        <div className="space-x-4">
          <Link to="/login" className="border border-green-700 text-green-700 px-4 py-2 rounded hover:bg-green-100 transition">
            Login
          </Link>
          <Link to='/signup' className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-4 md:px-20">
        <motion.h1 
          className="text-5xl font-bold text-green-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Save Food. Serve Humanity. 🌍
        </motion.h1>
        <p className="text-lg text-green-900 max-w-2xl mx-auto mb-6">
          Join a community-driven platform to share or claim near-expiry food items at no or low cost.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition">
            Donate Now
          </button>
          <button className="border border-green-700 text-green-700 hover:bg-green-100 px-6 py-2 rounded transition">
            Find Food
          </button>
        </div>
      </section>

      {/*  Features Section */}
      <section className="bg-white py-20 px-6 md:px-20">
        <h2 className="text-4xl font-bold text-center text-green-800 mb-16">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div 
            className="bg-green-50 rounded-3xl shadow-lg p-8 text-center hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
          >
            <FaMapMarkerAlt className="text-5xl text-green-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-green-800 mb-3">Geo-Tagged Listings</h3>
            <p className="text-green-700">Easily locate and list food items close to expiry around you with smart geo-tagging.</p>
          </motion.div>

          <motion.div 
            className="bg-green-50 rounded-3xl shadow-lg p-8 text-center hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
          >
            <FaHandshake className="text-5xl text-green-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-green-800 mb-3">Verified NGOs</h3>
            <p className="text-green-700">Partner with NGOs and certified organizations for reliable food distribution.</p>
          </motion.div>

          <motion.div 
            className="bg-green-50 rounded-3xl shadow-lg p-8 text-center hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
          >
            <FaChartPie className="text-5xl text-green-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-green-800 mb-3">Track & Celebrate Impact</h3>
            <p className="text-green-700">Visual dashboards to help you see how many meals you've helped save!</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-green-800 bg-green-200">
        &copy; {new Date().getFullYear()} GreenKart | Made with ❤ for sustainability
      </footer>
    </div>
  );
}
