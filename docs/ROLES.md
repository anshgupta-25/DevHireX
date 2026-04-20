# 👥 DevHireX — Team Roles & Responsibilities

> **Project:** DevHireX — Realtime Startup Hiring Platform  
> **Team Members:** Ansh Gupta & Dushyant  
> **Last Updated:** April 2026

---

## 🏗️ Architecture Overview

```
DevHireX - Realtime Startup/
├── src/                          ← 🎨 FRONTEND (Dushyant)
│   ├── components/
│   │   ├── dashboards/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── RecruiterDashboard.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   └── PostJobModal.tsx
│   │   ├── ui/                   (shadcn/ui components)
│   │   ├── GoogleAuthButton.tsx
│   │   ├── JobCard.tsx
│   │   ├── Logo.tsx
│   │   ├── NavLink.tsx
│   │   ├── Navbar.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusTimeline.tsx
│   │   └── UploadThingButton.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── firebase.ts
│   │   ├── socket.ts
│   │   ├── types.ts
│   │   ├── uploads.ts
│   │   ├── uploadthing.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── JobDetail.tsx
│   │   ├── Jobs.tsx
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Messages.tsx
│   │   ├── NotFound.tsx
│   │   ├── Profile.tsx
│   │   └── Signup.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── server/                       ← ⚙️ BACKEND (Ansh)
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── optionalAuth.js
│   ├── models/
│   │   ├── Application.js
│   │   ├── Job.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── applications.js
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   └── profile.js
│   ├── index.js
│   ├── socket.js
│   ├── seed.js
│   └── uploadthing.js
│
├── docs/                         ← 📚 DOCUMENTATION (Shared)
├── vite.config.ts                ← ⚙️ CONFIG (Ansh)
├── tailwind.config.ts            ← 🎨 CONFIG (Dushyant)
├── package.json                  ← 📦 SHARED
└── README.md                     ← 📄 SHARED
```

---

## 🎨 Dushyant — Frontend Developer

### Responsibilities

Dushyant owns the **entire frontend layer** of DevHireX — everything inside the `src/` directory.

### Scope of Work

| Area | Files / Folders | Description |
|------|----------------|-------------|
| **Pages** | `src/pages/*` | All 10 route pages — Landing, Login, Signup, Dashboard, Jobs, JobDetail, Messages, Profile, NotFound, Index |
| **Components** | `src/components/*` | Navbar, JobCard, StatCard, StatusTimeline, Logo, NavLink, GoogleAuthButton, UploadThingButton |
| **Dashboards** | `src/components/dashboards/*` | StudentDashboard, RecruiterDashboard, AdminDashboard, PostJobModal |
| **UI Library** | `src/components/ui/*` | All shadcn/ui primitives (Button, Dialog, Toast, Tabs, etc.) |
| **State & Context** | `src/contexts/AuthContext.tsx` | Auth state management, session handling, Google OAuth flow |
| **Hooks** | `src/hooks/*` | `use-mobile`, `use-toast` — custom React hooks |
| **Client Libs** | `src/lib/*` | API client (`api.ts`), Socket.IO client (`socket.ts`), Firebase config, UploadThing setup, TypeScript types |
| **Styling** | `src/index.css`, `src/App.css`, `tailwind.config.ts` | Global styles, Tailwind configuration, theme tokens |
| **App Entry** | `src/App.tsx`, `src/main.tsx` | Routing, providers, app bootstrap |
| **Frontend Config** | `index.html`, `postcss.config.js`, `tsconfig.*.json` | HTML entry, PostCSS, TypeScript config |

### Key Technologies

- **React 18** with TypeScript
- **Vite** (build tool & dev server)
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives)
- **Framer Motion** (animations — landing page, transitions)
- **Socket.IO Client** (real-time notifications & chat)
- **Firebase Auth** (Google OAuth integration)
- **UploadThing React** (file upload components)
- **React Router DOM** (client-side routing)
- **TanStack React Query** (server state management)
- **Recharts** (dashboard analytics charts)
- **Sonner** (toast notifications)

### Key Deliverables

1. ✅ Animated landing page with typewriter effect, floating particles, parallax orbs
2. ✅ Glassmorphism navbar with sticky positioning & responsive mobile menu
3. ✅ Role-based dashboards (Student / Recruiter / Admin)
4. ✅ Real-time messaging UI with online/offline indicators & unread badges
5. ✅ Job listing, search, filter & detail views
6. ✅ Application tracking with status timeline visualization
7. ✅ Profile management with avatar & resume upload
8. ✅ Google OAuth one-click login button
9. ✅ Live notification bell with dropdown panel
10. ✅ Responsive design across mobile, tablet, and desktop

---

## ⚙️ Ansh Gupta — Backend Developer

### Responsibilities

Ansh owns the **entire backend layer** of DevHireX — everything inside the `server/` directory, plus DevOps, database design, and deployment infrastructure.

### Scope of Work

| Area | Files / Folders | Description |
|------|----------------|-------------|
| **Server Entry** | `server/index.js` | Express app setup, Socket.IO initialization, CORS, middleware chain |
| **Database** | `server/config/db.js` | MongoDB Atlas connection via Mongoose |
| **Models** | `server/models/*` | Mongoose schemas — User, Job, Application, Message, Notification |
| **Controllers** | `server/controllers/*` | Business logic — auth, jobs, applications, messages, notifications, admin, profile |
| **Routes** | `server/routes/*` | RESTful API route definitions with role-based middleware |
| **Middleware** | `server/middleware/*` | JWT authentication (`auth.js`), optional auth (`optionalAuth.js`) |
| **Real-Time** | `server/socket.js` | Socket.IO event handlers — user mapping, room management, broadcast logic |
| **File Storage** | `server/uploadthing.js` | UploadThing server-side configuration |
| **Seeding** | `server/seed.js` | Database seeder for demo accounts |
| **Build Config** | `vite.config.ts` | Vite config including API proxy to backend |
| **Deployment** | Render / Vercel setup | Backend on Render, Frontend on Vercel, env management |

### Key Technologies

- **Node.js** + **Express.js** (REST API)
- **MongoDB Atlas** + **Mongoose** (ODM)
- **Socket.IO** (WebSocket server for real-time events)
- **JWT** + **bcryptjs** (authentication & password hashing)
- **UploadThing** (cloud file storage service)
- **CORS** (cross-origin request handling)

### Key Deliverables

1. ✅ JWT-based authentication with bcrypt password hashing
2. ✅ Role-based access control middleware (Student / Recruiter / Admin)
3. ✅ RESTful API endpoints for all CRUD operations
4. ✅ Real-time Socket.IO server — notifications, messaging, online status
5. ✅ MongoDB schema design with compound indexes & referential integrity
6. ✅ Cascading delete logic (user removal → cleanup of jobs, applications, messages, notifications)
7. ✅ UploadThing integration for persistent CDN-backed file storage
8. ✅ Database seeder with demo accounts
9. ✅ API proxy configuration (Vite → Express)
10. ✅ Production deployment setup (Render for backend, Vercel for frontend)

---

## 🤝 Shared Responsibilities

| Area | Owner | Description |
|------|-------|-------------|
| **README.md** | Both | Project overview & setup instructions |
| **Documentation** | Both | All files in `docs/` folder |
| **Git Workflow** | Both | Branching, PRs, code reviews |
| **Testing** | Both | Unit tests (`vitest`), E2E tests (`playwright`) |
| **package.json** (root) | Both | Dependency management |
| **Integration Points** | Both | API contracts, Socket event names, TypeScript types |

---

## 📋 Integration Contract

The frontend and backend communicate through these agreed-upon interfaces:

### API Endpoints (REST)

| Module | Base Route | Owner (Logic) | Consumer |
|--------|-----------|---------------|----------|
| Auth | `/api/auth/*` | Ansh | Dushyant |
| Jobs | `/api/jobs/*` | Ansh | Dushyant |
| Applications | `/api/applications/*` | Ansh | Dushyant |
| Messages | `/api/messages/*` | Ansh | Dushyant |
| Notifications | `/api/notifications/*` | Ansh | Dushyant |
| Admin | `/api/admin/*` | Ansh | Dushyant |
| Profile | `/api/profile/*` | Ansh | Dushyant |

### Socket.IO Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `register` | Client → Server | Register user socket on login |
| `newJobPosted` | Server → Client | Broadcast new job to all students |
| `newApplication` | Server → Client | Notify recruiter of new applicant |
| `applicationStatusChanged` | Server → Client | Notify student of status update |
| `newMessage` | Server → Client | Deliver chat message in real-time |
| `userOnline` / `userOffline` | Server → Client | Online status broadcast |

---

## 📌 Summary

| | **Dushyant** | **Ansh** |
|--|-------------|---------|
| **Domain** | Frontend (React/TypeScript) | Backend (Node.js/Express) |
| **Directory** | `src/` | `server/` |
| **Focus** | UI/UX, components, state, routing | APIs, database, auth, real-time |
| **Deploy** | Vercel / Netlify | Render.com |
| **Config** | `tailwind.config.ts`, `tsconfig.*` | `vite.config.ts`, `.env` |

> 💡 **Workflow Tip:** Always sync on API changes. If Ansh modifies a route response shape or adds a new Socket event, update `src/lib/types.ts` together so both sides stay in sync.
