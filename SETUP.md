# Dev HireX — Setup Guide

A full-stack MERN (MongoDB, Express, React, Node.js) hiring platform with real-time notifications and messaging.

---

## Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | v18+ recommended |
| **npm** | v9+ |
| **MongoDB Atlas** | Free tier works (or any MongoDB instance) |

---

## 1. Clone & Install

```bash
# Clone the repo
git clone <your-repo-url>
cd talent-connect-85

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

## 2. Configure Environment Variables

```bash
# Copy the sample env file
cp server/.env.example server/.env
```

Edit `server/.env` and fill in your values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hireflow?retryWrites=true&w=majority
JWT_SECRET=any_random_secret_string_here
PORT=5001

# UploadThing (for file persistence)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

### Getting a MongoDB URI

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free account
2. Create a new cluster (free M0 tier is fine)
3. Go to **Database Access** → Add a database user with a password
4. Go to **Network Access** → Add `0.0.0.0/0` to allow connections from anywhere (for development)
5. Go to **Database** → Click **Connect** → Choose **Drivers** → Copy the connection string
6. Replace `<password>` in the URI with your database user's password

### 2a. Setup UploadThing
1. Go to [UploadThing](https://uploadthing.com/) and create a free project.
2. Go to **Dashboard** → **API Keys**.
3. Copy **Secret Key** (`UPLOADTHING_SECRET`) and **App ID** (`UPLOADTHING_APP_ID`) to your `.env`.

### 2b. Setup Firebase (Google Login)
The project is configured to use Firebase for Google Authentication.
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Google Auth** in the Authentication section.
3. Add a Web App to get your project credentials.
4. Update `src/lib/firebase.ts` with your configuration if needed.

---

## 3. Seed the Database (Optional)

This creates sample user accounts so you can test login immediately:

```bash
cd server
node seed.js
```

This will create the following accounts (all with password `password123`):

| Role | Email | Password |
|------|-------|----------|
| Student | alex@example.com | password123 |
| Student | sarah@example.com | password123 |
| Recruiter | emily@novatech.com | password123 |
| Recruiter | james@cloudpeak.com | password123 |
| Admin | admin@hireflow.com | password123 |
| **Super Admin** | **ansh25** | **ansh2501** |

> **Note:** Seeding clears all existing data. Skip this step if you want to start fresh and register through the app.

---

## 4. Run the Application

You need **two terminals** — one for the backend and one for the frontend:

**Terminal 1 — Backend (Express API + Socket.IO):**
```bash
cd server
npm run dev
```
→ Starts on `http://localhost:5001`

**Terminal 2 — Frontend (Vite + React):**
```bash
npm run dev
```
→ Starts on `http://localhost:8080`

Open **http://localhost:8080** in your browser.

---

## 5. Project Structure

```
talent-connect-85/
├── src/                      # React frontend (Vite)
│   ├── components/           # UI components
│   │   ├── dashboards/       # Student, Recruiter, Admin dashboards
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Navbar.tsx        # Navigation with notifications
│   │   └── StatCard.tsx      # Dashboard stat cards
│   ├── contexts/             # Auth context
│   ├── lib/                  # API client, socket, types
│   ├── pages/                # Route pages
│   └── hooks/                # Custom React hooks
├── server/                   # Express backend
│   ├── config/               # Database config
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth & role middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── socket.js             # Socket.IO handlers
│   ├── seed.js               # Database seeder
│   └── index.js              # Server entry point
├── vite.config.ts            # Vite config with API proxy
└── package.json              # Frontend dependencies
```

---

## 6. API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (requires token) |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs (supports `?search=`, `?type=`, `?recruiter=me`) |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs` | Create a job (recruiter only) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply to a job (student only) |
| GET | `/api/applications` | Get applications (filtered by role) |
| PUT | `/api/applications/:id` | Update application status (recruiter only) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user's notifications |
| PUT | `/api/notifications/:id/read` | Mark notification as read |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/contacts` | Get chat contacts |
| GET | `/api/messages/:contactId` | Get messages with a contact |
| POST | `/api/messages` | Send a message |

---

## 7. Key Features

- **JWT Authentication** — Signup/Login with role-based access (Student, Recruiter, Admin)
- **Job Posting** — Recruiters can post jobs via the dashboard
- **Job Applications** — Students can apply, recruiters can accept/reject
- **Real-time Notifications** — Socket.IO powered notifications for:
  - New job posted → All students notified
  - Student applies → Recruiter notified
  - Status change (accepted/rejected) → Student notified
- **Real-time Messaging** — Chat between students and recruiters
- **Admin Dashboard** — Platform stats and user management

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `EADDRINUSE: port 5001` | Kill the existing process: `lsof -ti:5001 \| xargs kill -9` |
| MongoDB SSL error | Ensure `tlsInsecure: true` is in `config/db.js` (already set) |
| `Cannot connect to MongoDB` | Whitelist `0.0.0.0/0` in Atlas **Network Access** |
| Frontend shows empty data | Make sure the backend is running on port 5001 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Real-time | Socket.IO |
