# 🚀 Realtime Startup Hiring Platform

A modern, full-stack MERN application designed to connect startups with top talent. This platform features distinct portals for **Students (Job Seekers)** and **Recruiters (Startups)**, allowing for real-time job posting, application tracking, and instant notifications.

## ✨ Features

- **Role-Based Portals**: Dedicated environments for both Students and Recruiters.
- **Robust Session Management**: Support for simultaneous tab-independent sessions.
- **Google Authentication**: Seamless one-click login powered by **Firebase**.
- **Persistent File Storage**: Integrated with **UploadThing** for reliable resume and profile picture uploads.
- **Real-Time Notifications (Socket.IO)**: 
  - Students are instantly notified when a new job is posted.
  - Recruiters are instantly notified when a student applies for a job.
  - Students are instantly notified when their application status changes.
- **Responsive UI/UX**: Built with modern aesthetics, dark mode, and Tailwind CSS.
- **Application Tracking**: Real-time status updates on submitted applications.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS & shadcn/ui
- **Firebase Auth** (Google Login)
- **UploadThing** (File Management)
- Socket.IO Client
- Lucide React Icons

**Backend:**
- Node.js & Express
- MongoDB (Mongoose & Atlas)
- **UploadThing** (Storage Service)
- Socket.IO (WebSockets)
- JWT Authentication

---

## 💻 Local Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- A free MongoDB Atlas cluster account

### 2. Clone the Repository
```bash
git clone https://github.com/anshgupta-25/Realtime-Startup-company-Hiring-platform.git
cd Realtime-Startup-company-Hiring-platform
```

### 3. Setup the Backend
Open a terminal and navigate to the `server` folder:
```bash
cd server
npm install
```

Create an environment file:
```bash
cp .env.example .env
```

Open `.env` and configure your credentials:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hireflow?retryWrites=true&w=majority
JWT_SECRET=supersecretkey
PORT=5000
```
Run the backend server:
```bash
npm run dev
```

### 4. Setup the Frontend
Open a **new** terminal and stay in the root folder (or `src` depending on where it sits):
```bash
npm install
npm run dev
```

The frontend will start at `http://localhost:8080`, and Vite will automatically proxy API and Socket.IO requests to the backend at `http://localhost:5001`.

---

## 🚀 Production Deployment Guide

To deploy this correctly on the internet, you must host the **frontend** and **backend** separately because Serverless platforms (like Vercel) do not support continuous WebSocket connections for Socket.IO.

### 1. Backend Deployment (Render.com)
1. Go to [Render](https://render.com) and create a **Web Service**.
2. Connect this GitHub repository.
3. Use the following configuration:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add your Environment Variables (`MONGO_URI`, `JWT_SECRET`, `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`, `PORT`).
5. Click deploy and **copy the live URL** once finished.

### 2. Frontend Deployment (Vercel / Netlify)
1. Import your GitHub repository to Vercel or Netlify.
2. In the deployment settings, add the following Environment Variables:
   - **Key**: `VITE_API_URL` → **Value**: *(Your Render URL)*
   - **Key**: `VITE_UPLOADTHING_SECRET` & `VITE_UPLOADTHING_APP_ID`
   - **Key**: `VITE_FIREBASE_API_KEY` (and other Firebase config keys if not hardcoded)
3. Deploy the application.

Your complete Full-Stack real-time application is now live!
