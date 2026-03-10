# 🏢 Promesa Midtown — Society Management Portal

> **Address:** Pestom Sagar Road No 4, Chembur West 400089, Mumbai, Maharashtra

A full-stack **MERN** (MongoDB, Express, React, Node.js) society management web application for **Promesa Midtown**. Containerized with Docker Compose for easy deployment. The UI is inspired by Apple's design language — clean, minimalist, and modern.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  User Browser                   │
└──────────────────────┬──────────────────────────┘
                       │ HTTP :80
┌──────────────────────▼──────────────────────────┐
│           Frontend (React + Vite)               │
│              Served via Nginx                   │
│         Container: promesa_frontend             │
└──────────────────────┬──────────────────────────┘
                       │ HTTP :5000 (proxy /api)
┌──────────────────────▼──────────────────────────┐
│          Backend (Node.js + Express)            │
│              REST API Server                    │
│         Container: promesa_backend              │
└──────────────────────┬──────────────────────────┘
                       │ TCP :27017
┌──────────────────────▼──────────────────────────┐
│              Database (MongoDB 7)               │
│         Container: promesa_mongo                │
│         Volume: mongo_data (persistent)         │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)

### 1. Clone the repository
```bash
git clone https://github.com/ARajbhar007/Project-Promesa.git
cd Project-Promesa
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set a strong JWT_SECRET
```

### 3. Launch all services
```bash
docker-compose up --build
```

### 4. Access the application
| Service | URL |
|---------|-----|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost:5000/api |
| **Health Check** | http://localhost:5000/api/health |
| **MongoDB** | mongodb://localhost:27017/promesa_midtown |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), React Router v6, Axios, React Toastify |
| **Backend** | Node.js 20, Express 4, Mongoose 8 |
| **Database** | MongoDB 7 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Containerization** | Docker + Docker Compose |
| **Web Server** | Nginx (frontend serving + API proxy) |

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Resident** | Own profile, vehicles, maintenance, complaints, compound requests |
| **Admin** | All resident data, update statuses, add maintenance records |
| **Security** | Same as Resident (expandable) |

### Creating the First Admin
Register normally, then update the role in MongoDB:
```javascript
db.users.updateOne({ username: "yourusername" }, { $set: { role: "Admin" } })
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT token |
| GET | /api/users/profile | Get logged-in user profile |
| PUT | /api/users/profile | Update profile |
| GET | /api/vehicles | Get user's vehicles |
| POST | /api/vehicles | Add vehicle |
| PUT | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle |
| GET | /api/maintenance | Get maintenance records |
| POST | /api/maintenance | Add record |
| PUT | /api/maintenance/:id | Update record |
| GET | /api/complaints | Get complaints |
| POST | /api/complaints | File a complaint |
| PUT | /api/complaints/:id | Update complaint status |
| GET | /api/compound-requests | Get requests |
| POST | /api/compound-requests | Submit request |
| PUT | /api/compound-requests/:id | Approve/Reject (Admin) |

---

## 🔐 Environment Variables

### Root `.env`
```env
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

### Backend `.env`
```env
MONGO_URI=mongodb://mongo:27017/promesa_midtown
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
PORT=5000
NODE_ENV=production
```

---

*© 2024 Promesa Midtown — Pestom Sagar Road No 4, Chembur West 400089*
