# SyncBoard – Collaborative Real-Time Task Board

SyncBoard is a full-stack, real-time Kanban-style team collaboration platform built as a progressively engineered MERN web application. Teams can create workspaces, manage personal and organizational task boards, collaborate in real time with WebSocket live sync, handle concurrency conflicts gracefully, and work seamlessly even across offline periods.

---

## 🚀 Live Application & Deployment
- **Deployed Application URL**: [SyncBoard Live](https://syncboard-client.onrender.com) *(Update with your production URL)*
- **Backend API URL**: [SyncBoard API](https://syncboard-api.onrender.com) *(Update with your backend URL)*
- **GitHub Repository**: [GitHub - Full-Stack_workshop-project](https://github.com/SenumiCosta/Full-Stack_workshop-project)

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, REST API, JWT Authentication, Nodemailer |
| **Database** | MongoDB, Mongoose ODM |
| **Real-Time** | WebSockets (Socket.io) |
| **State & Offline** | React Context API, LocalStorage Caching, Optimistic UI Updates |
| **Testing** | Vitest + React Testing Library (Frontend), Jest + Supertest (Backend) |
| **DevOps & CI/CD** | Docker, Docker Compose, GitHub Actions CI Pipeline, Nginx |

---

## 🏛️ System Architecture

```
                                +--------------------------------------+
                                |         Browser / Client             |
                                |     (React 18 + Vite + SPA)          |
                                +-------------------+------------------+
                                                    |
                                       HTTP REST / WebSocket
                                                    |
                                                    v
+------------------------+      +-------------------+------------------+
|      Nginx Proxy       |<---->|           Node.js / Express          |
|    (Frontend Docker)   |      |            REST API Server           |
+------------------------+      +---------+------------------+---------+
                                          |                  |
                                     Mongoose            Socket.io
                                          |                  |
                                          v                  v
                               +----------+-------+  +-------+----------+
                               |     MongoDB      |  | Real-Time Events |
                               |    Persistence   |  | (Broadcast Sync) |
                               +------------------+  +------------------+
```

### Component Flow
1. **Authentication**: Users register or log in; the server issues signed JWT tokens stored securely on the client.
2. **Workspace & Organizations**: Users can switch between Personal Workspaces and Organizations, invite registered members via email tokens, and collaborate on shared boards.
3. **Real-time Live Sync**: Socket.io broadcasts board changes (task created, moved between columns, edited, or deleted) instantly across all connected clients.
4. **Concurrency Conflict Detection**: Updates include client timestamp tracking (`_clientUpdatedAt`). If an update is older than the server's `updatedAt`, the server returns HTTP `409 Conflict` with conflicting data, surfacing an interactive resolution modal instead of silently overwriting changes.
5. **Offline Support & Persistence**: Boards and tasks are persisted in client-side `localStorage`. When connectivity drops, users can still review cached boards with clear offline badges.

---

## 📋 Features

- **Full Kanban Lifecycle**: Columns for `Not Started`, `Doing`, and `Done` with drag-and-drop mechanics.
- **GitHub-style Organizations**: Create team workspaces, invite registered SyncBoard members via email, and share team boards.
- **Real-Time Live Collaboration**: Live indicators and instant WebSocket task updates without page refresh.
- **Optimistic Concurrency Control**: Detects simultaneous conflicting edits and lets users review changes.
- **Automated CI/CD Pipeline**: GitHub Actions runs both frontend (Vitest) and backend (Jest + Supertest) tests on every push and pull request.
- **Containerized Deployment**: Multi-service Docker Compose configuration for one-command local runs.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18 or v20)
- MongoDB installed locally or MongoDB Atlas connection string
- Git

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SenumiCosta/Full-Stack_workshop-project.git
   cd Full-Stack_workshop-project
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Create server/.env file
   # MONGO_URI=mongodb://localhost:27017/syncboard
   # JWT_SECRET=your_jwt_secret_key_here
   # PORT=5000
   # CLIENT_URL=http://localhost:5173
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../syncboard-client
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Setup

Run the entire multi-service stack (MongoDB, Backend, Frontend) with a single command:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`

To stop the containers:
```bash
docker-compose down
```

---

## 🧪 Automated Testing

### Backend Tests (Jest + Supertest)
```bash
cd server
npm test
```
*Executes unit and integration tests covering Authentication, Boards, Tasks, and Concurrency Conflict Detection.*

### Frontend Tests (Vitest + React Testing Library)
```bash
cd syncboard-client
npm test -- --run
```
*Executes 29 tests across 8 test suites validating authentication screens, modals, dashboard state, and offline hooks.*

---

## ⚠️ Known Limitations

1. **Email Service**: Uses Ethereal test email service by default for local development. For commercial production, configure production SMTP (e.g. SendGrid, Amazon SES, or Gmail App Password).
2. **Offline Mode Mutation Queue**: While cached boards and tasks can be viewed offline, queued mutations are currently synced upon manual reload rather than automatic background sync worker.
3. **File Attachments**: Tasks currently support rich text titles, priorities, assignees, and descriptions; binary attachment storage (e.g. AWS S3) is earmarked for future releases.