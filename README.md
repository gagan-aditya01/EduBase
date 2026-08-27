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
| **Backend** | Node.js, Express 5, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `multer` |
| **Database** | MongoDB Atlas / MongoDB Local (Relational Mongoose `.populate()`) |
| **Testing** | Jest, Supertest (Automated HTTP Integration Tests) |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 🚀 Key Features & Concepts Implemented

### 1. 🛡️ Authentication & Role-Based Access Control (RBAC)
- **JWT Session Security**: Secure Token-based Authentication with password hashing (`bcryptjs`).
- **Role Permissions**: `Admin` (full CRUD, password management, guest account deletion) vs `Guest` (read-only access).
- **Welcome Hello Splash**: Post-login Apple-style handwritten stroke vector animation (`apple-hello-effect.tsx`).
- **Account Manager Deck**: 3D perspective flip deck console for changing passwords & managing users.

### 2. 🗂️ Relational Data Modeling & Server-Side Pagination
- **Mongoose Relational Joins**: Dedicated `Department` collection schema populated dynamically via `departmentRef` (`.populate('departmentRef', 'name code')`).
- **Server-Side Pagination**: Supports `page` and `limit` query parameters with MongoDB `skip()` / `limit()` and total count metadata (`{ page, limit, totalPages, totalStudents, data }`).
- **Data Ownership (`createdBy`)**: Tracks and displays creator user badges on every record.

### 3. 📜 System Audit Trail & Activity Log
- **Immutable Audit Trail**: Dedicated `AuditLog` collection recording `CREATE_STUDENT`, `UPDATE_STUDENT`, and `DELETE_STUDENT` actions with timestamps and admin handles.

### 4. 🛡️ Input Validation & Custom Human-Friendly Errors
- **Input Validation Middleware**: Sanitizes `studentId`, `name`, `age` (positive numbers), and `department` fields before controller execution.
- **Human-Friendly Error Handler**: Converts technical database errors (`code 11000 duplicate key`, `CastError`, `ValidationError`, `JWT Expired`, `404 Not Found`) into readable messages.

### 5. 📊 Data Export & Media Uploads
- **One-Click CSV Export**: Download filtered student directory data directly as a `.csv` file.
- **Multer Upload Middleware**: Handles image/PDF file uploads up to 5MB served via `/uploads`.

### 6. ✨ Aesthetics & Team Section
- **Liquid Metal Shader Buttons**: WebGL shader canvas action buttons.
- **Tech Stack Marquee**: Continuous infinite auto-scrolling marquee using Embla AutoScroll (`stopOnInteraction: false`).
- **Team Section**: 2-member profile cards (**Yashwanth** - Lead Architect & **Gagan Aditya** - UI/UX Engineer) with white avatar rings in dark mode.

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

---

## 👥 Core Engineering Team

<div align="center">

<table>
  <tr>
    <td align="center" width="50%">
      <a href="https://github.com/gagan-aditya01">
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
      <i>Full-Stack Architecture, Express 5 REST APIs, MongoDB Relational Models & JWT Security</i>
      <br />
      <br />
      <a href="https://github.com/gagan-aditya01/EduBase/graphs/contributors">
        <img src="https://img.shields.io/badge/Collaborator-Yashwanth-10B981?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Collaborator"/>
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
