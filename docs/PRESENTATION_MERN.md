# 🚀 Project Presentation: MERN Technical Stack

This document provides a deep dive into the **Full-Stack (MERN)** architecture of the project. Use this as a reference for your presentation and potential viva questions.

---

## 🏗️ System Architecture

The application follows a standard **Client-Server-Database** architecture:

1.  **Frontend (React + Vite):** A modern, responsive SPA (Single Page Application) that communicates with the backend via RESTful APIs and WebSockets.
2.  **Backend (Node.js + Express):** A scalable server handling business logic, authentication, and real-time event orchestration.
3.  **Database (MongoDB + Mongoose):** A NoSQL document store that provides flexibility for evolving schemas.
4.  **Real-Time Layer (Socket.IO):** Bi-directional communication for instant updates.

---

## 🔐 Authentication & Authorization

We implemented a **Hybrid Authentication System**:

-   **Local Auth:** Traditional Email/Password login using `bcryptjs` for secure hashing and `JSON Web Tokens (JWT)` for stateless session management.
-   **Social Auth (Firebase):** Integrated **Firebase Google Auth** for a seamless, one-click landing experience.
-   **Role-Based Access Control (RBAC):** Middleware checks for `student`, `recruiter`, and `admin` roles before allowing access to specific routes (e.g., only recruiters can post jobs).

---

## 📦 Database Modeling (Mongoose)

### Key Collections:
-   **Users:** Stores profiles, skills, and auth provider details.
-   **Jobs:** Contains job descriptions, requirements, and reference to the creator (`createdBy`).
-   **Applications:** Links `Users` and `Jobs` with a unique compound index `(userId, jobId)` to prevent duplicate applications.
-   **Messages:** Stores real-time chat history between users.
-   **Notifications:** Tracks system alerts and status updates.

---

## 📡 Real-Time Features (Socket.IO)

The platform feels "alive" due to real-time events:
-   **Job Alerts:** When a recruiter posts a job, all students receive a live notification.
-   **Chat:** Instant messaging with `online/offline` status indicators.
-   **Status Updates:** Students get notified immediately when their application status changes (e.g., "Shortlisted").

---

## ☁️ Cloud Integrations

-   **UploadThing:** Instead of storing files on the local server (which breaks on platforms like Render), we use **UploadThing** for persistent, CDN-backed storage of Resumes and Profile Avatars.
-   **Firebase Cloud:** Handles the heavy lifting of Google OAuth handshake.

---

## 🎓 Potential Viva Questions (MERN)

1.  **Why use JWT instead of Sessions?**
    -   *Statelessness:* No need to store session data on the server, making it easier to scale horizontally.
2.  **How do you prevent SQL Injection/NoSQL Injection?**
    -   *Mongoose Schemas:* Strictly define data types.
    -   *Query Sanitization:* Using parameterized queries/Mongoose methods instead of raw strings.
3.  **What is the role of Middleware in Express?**
    -   It acts as a bridge between the request and the response (e.g., checking if a user is logged in before they can view their profile).
