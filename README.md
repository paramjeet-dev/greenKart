# 🥬 GreenKart – Expiring Food Exchange Network

GreenKart is a MERN stack-based web platform aimed at reducing food waste by allowing individuals, NGOs, and organizations to **list and claim** near-expiry or surplus food items. Users can donate food, view listings near them, chat in real time, and manage donations via a beautiful and intuitive dashboard.

## 🚀 Features

- 📝 Add food listings with expiry date, price (optional), and image
- 📍 Auto-location detection using OpenStreetMap API
- 🧾 Listings categorized by status: Active, Claimed, Expired
- 📊 Dashboard with listing stats (Chart.js)
- 💬 Real-time messaging between users via Socket.IO
- 📥 User Inbox with latest chats and popup-based messaging
- 🗂️ Role-based accounts (Donor, NGO, Individual)
- ☁️ Image upload via Cloudinary
- 🔐 JWT-based secure authentication

## 🧠 Tech Stack

### Frontend:
- React.js + Vite
- Tailwind CSS
- React Hook Form
- Framer Motion
- React Icons
- React Chart.js 2
- React Router
- React Toastify

### Backend:
- Node.js + Express.js
- MongoDB + Mongoose
- Cloudinary (image hosting)
- Socket.IO (for real-time messaging)
- OpenStreetMap Nominatim API (reverse geocoding)
- JWT for authentication

## 📦 Installation & Setup

### 🔧 Prerequisites
- Node.js & npm
- MongoDB (local or cloud)
- Cloudinary account

### Frontend:
```
- cd frotnend
- npm i
- npm run dev
```
### Backend:
```
- cd backend
- npm i
- node server.js
  ```
