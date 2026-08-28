# 🎓 EduBase - Full-Stack Student Management Portal

A modern, production-grade full-stack web application built with **Node.js, Express, MongoDB Atlas, React 18, TypeScript, Tailwind CSS, Framer Motion, and Docker**.

[![Git Commit](https://img.shields.io/github/last-commit/gagan-aditya01/EduBase?style=flat-square&color=blue)](https://github.com/gagan-aditya01/EduBase.git)
[![Docker Support](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white)](https://github.com/gagan-aditya01/EduBase.git)
[![Automated Tests](https://img.shields.io/badge/Jest-100%25_Passing-brightgreen?style=flat-square&logo=jest)](https://github.com/gagan-aditya01/EduBase.git)

---

## 🌟 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, `@paper-design/shaders` |
| **Backend** | Node.js, Express 5, Mongoose, Dual JWT Auth, `bcryptjs`, `multer`, RAM Cache |
| **Database** | MongoDB Atlas / MongoDB Local (Relational Mongoose `.populate()`, Compound Indexes) |
| **Testing** | Jest, Supertest (100% Passing Automated Integration Tests) |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 🚀 Key Features & Concepts Implemented

### 1. 🛡️ Dual-Token Authentication, OAuth 2.0 & RBAC
- **Dual-Token Auth**: Access Tokens + Long-lived Refresh Tokens (`POST /api/v1/auth/refresh`) for silent session renewal.
- **OAuth 2.0 Social Login**: Integrated **Google** & **GitHub** social single sign-on (`POST /api/v1/auth/social`).
- **Role Permissions**: `Admin` (full CRUD, password management, soft-delete recovery) vs `Guest` (read-only access).
- **Modern Animated Login**: `modern-animated-sign-in.tsx` with **EduBase** branding, orbiting tech icons, and social OAuth buttons.
- **Welcome Splash & 3D Deck**: Post-login Apple-style stroke animation and 3D account manager deck flip.

### 2. 🗂️ Relational Data Modeling, Server-Side Pagination & API v2
- **Mongoose Relational Joins**: Dedicated `Department` collection schema populated dynamically via `departmentRef` (`.populate('departmentRef', 'name code')`).
- **Server-Side Pagination**: Supports `page` and `limit` query parameters with MongoDB `skip()` / `limit()` offset queries.
- **API Versioning (v1 & v2)**: Legacy `/api/v1/students` and structured `/api/v2/students` with HATEOAS pagination links.
- **Data Ownership (`createdBy`)**: Tracks and displays creator user badges on every record.

### 3. 🗄️ Soft Deletes & Admin Trash Recovery Console
- **Soft Delete Protection**: Setting `isDeleted: true` and `deletedAt: Date` prevents accidental database data loss.
- **Trash Bin Console**: Admin endpoints to list (`GET /trash/list`), restore (`PUT /restore`), or permanently purge (`DELETE /purge`) records.

### 4. ⚡ High-Performance Caching, Aggregation Pipelines & SSE Stream
- **MongoDB Aggregation Pipelines**: Multi-faceted analytics engine (`$group`, `$facet`, `$bucket`) powering department breakdown and age demographic metrics (`GET /api/v1/students/analytics/stats`).
- **Real-Time Server-Sent Events (SSE)**: HTTP event stream (`GET /api/v1/students/stream`) pushing live record mutations directly to client UI.
- **In-Memory RAM Cache Engine**: Custom TTL cache returning sub-millisecond responses (`X-Cache: HIT` / `MISS`) with automatic invalidation.
- **Async Background Task Queue**: Non-blocking queue engine offloading audit logging without delaying HTTP controller responses.
- **Compound Database Indexes**: Optimized Mongoose indexes (`{ department: 1, age: -1 }`) and `.explain('executionStats')` benchmark route.

### 5. 📜 Audit Trail, CI/CD Pipeline & Security Hardening
- **Automated CI/CD Pipeline**: `.github/workflows/ci-cd.yml` running automated MongoDB container integration tests and production build checks on every push.
- **Immutable Audit Log**: `AuditLog` collection recording `CREATE_STUDENT`, `UPDATE_STUDENT`, and `DELETE_STUDENT` actions.
- **API Security & DDoS Guard**: `helmet` HTTP headers and `express-rate-limit` (max 100 requests per 15 mins).
- **Input Validation Middleware**: Sanitizes `studentId`, `name`, `age` (16–90 range), and `department` fields.
- **Human-Friendly Error Handler**: Converts technical database errors (`code 11000 duplicate key`, `CastError`, `ValidationError`) into readable messages.

### 6. 📊 Data Export, Media Uploads & Aesthetics
- **One-Click CSV Export**: Download filtered student directory data directly as a `.csv` file.
- **Multer Upload Middleware**: Handles image/PDF file uploads up to 5MB served via `/uploads`.
- **Liquid Metal Shader Buttons**: WebGL shader canvas action buttons.
- **Tech Stack Marquee**: Continuous infinite auto-scrolling marquee using Embla AutoScroll.

---

## 🛠️ Getting Started Locally

### Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: MongoDB Atlas Cluster URI or local MongoDB instance (`mongodb://localhost:27017/edubase`)

### 1. Clone Repository
```bash
git clone https://github.com/gagan-aditya01/EduBase.git
cd EduBase
```

### 2. Install Dependencies
```bash
# Install root dependencies (Express, Mongoose, Jest, Supertest, Multer)
npm install

# Install frontend dependencies (Vite, React, Tailwind, Framer Motion)
cd frontend
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file inside `backend/`:
```env
PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edubase?retryWrites=true&w=majority
JWT_SECRET=supersecretkey123
JWT_REFRESH_SECRET=supersecretrefreshkey456
```

### 4. Run Development Servers
```bash
# Terminal 1: Run Backend Server (Port 5050)
node backend/src/server.js

# Terminal 2: Run Frontend Dev Server (Port 5173)
cd frontend
npm run dev
```

---

## 🐳 Running with Docker & Docker Compose

Launch the entire stack (**Backend + React Frontend + Local MongoDB**) with a single command:

```bash
docker-compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:5050`
- **MongoDB**: `localhost:27017`

---

## 🧪 Automated Testing

Run the automated Jest + Supertest integration test suite:

```bash
npm test
```

**Test Coverage**:
- `GET /`: API Health Check & Status Page (200 OK)
- `GET /api/students`: JWT Authorization Guard (401 Unauthorized)
- `POST /api/students`: Unauthenticated Submission Guard (401 Unauthorized)
- `GET /api/unhandled-route`: Custom 404 Route Not Found Handler
- `Validation Error Tests`: Duplicate ID, Negative Age, Age > 90 (400 Bad Request)
- `Dual-Token & API v2 Tests`: Refresh Token Renewal, v2 HATEOAS Envelope, Trash Bin Console (200 OK)

---

## 👥 Core Engineering Team

<div align="center">

<table>
  <tr>
    <td align="center" width="50%">
      <a href="https://github.com/YashwanthReddyPuli">
        <img src="https://raw.githubusercontent.com/gagan-aditya01/EduBase/main/Teams/member1.jpg" width="140px" style="border-radius: 50%; object-fit: cover; aspect-ratio: 1/1;" alt="Yashwanth Profile Photo"/>
        <br />
        <br />
        <sub><b>Yashwanth</b></sub>
      </a>
      <br />
      <br />
      <code><b>Lead Architect</b></code>
      <br />
      <br />
      <i>Full-Stack Architecture, Express 5 REST APIs, MongoDB Relational Models & Dual JWT Security</i>
      <br />
      <br />
      <a href="https://github.com/YashwanthReddyPuli">
        <img src="https://img.shields.io/badge/GitHub-@YashwanthReddyPuli-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile"/>
      </a>
    </td>
    <td align="center" width="50%">
      <a href="https://github.com/gagan-aditya01">
        <img src="https://raw.githubusercontent.com/gagan-aditya01/EduBase/main/Teams/member2.jpg" width="140px" style="border-radius: 50%; object-fit: cover; aspect-ratio: 1/1;" alt="Gagan Aditya Profile Photo"/>
        <br />
        <br />
        <sub><b>Gagan Aditya</b></sub>
      </a>
      <br />
      <br />
      <code><b>UI/UX Engineer</b></code>
      <br />
      <br />
      <i>Frontend Design System, Liquid Metal WebGL Shaders, Framer Motion Physics & UI Architecture</i>
      <br />
      <br />
      <a href="https://github.com/gagan-aditya01">
        <img src="https://img.shields.io/badge/GitHub-@gagan--aditya01-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile"/>
      </a>
    </td>
  </tr>
</table>

</div>

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
