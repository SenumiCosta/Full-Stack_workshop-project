# SyncBoard – Collaborative Task Board

## Live URL
[Deployed App](https://your-app-url.com)

## Tech Stack
- Frontend: React, React Router, Axios, Socket.io-client
- Backend: Node.js, Express, Socket.io
- Database: MongoDB (Mongoose)
- Testing: Jest, Supertest, React Testing Library
- CI/CD: GitHub Actions
- Containerization: Docker, Docker Compose

## Setup Instructions

### Development Setup
1. Clone the repository
2. Install frontend dependencies: `npm install`
3. Install backend dependencies: `cd server && npm install`
4. Create `.env` in server folder with MONGO_URI and JWT_SECRET
5. Create `.env` in root folder with VITE_API_URL and VITE_SOCKET_URL
6. Start backend: `cd server && npm run dev`
7. Start frontend: `npm run dev`

### Docker Setup
```bash
docker-compose up -d