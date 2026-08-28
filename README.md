# 🎓 EduBase - Full-Stack Student Management Portal

A modern, production-grade full-stack web application built with **Node.js, Express 5, MongoDB Atlas, React 18, TypeScript, Tailwind CSS, Framer Motion, and Docker**.

[![Git Commit](https://img.shields.io/github/last-commit/gagan-aditya01/EduBase?style=flat-square&color=blue)](https://github.com/gagan-aditya01/EduBase.git)
[![Docker Support](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white)](https://github.com/gagan-aditya01/EduBase.git)
[![Automated Tests](https://img.shields.io/badge/Jest-100%25_Passing-brightgreen?style=flat-square&logo=jest)](https://github.com/gagan-aditya01/EduBase.git)

---

## 🌟 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, `@paper-design/shaders` |
| **Backend** | Node.js, Express 5, Mongoose, Dual JWT Auth, `bcryptjs`, `multer`, RAM Cache |
| **Database** | MongoDB Atlas / Local MongoDB (Relational Mongoose `.populate()`, Compound Indexes) |
| **Testing & DevOps** | Jest, Supertest (100% Pass), Docker, Docker Compose, Nginx |

---

## 🚀 Architectural Concepts Implemented

- **🔄 Dual-Token Auth & Refresh Flow**: Access Tokens + Long-lived Refresh Tokens (`POST /api/v1/auth/refresh`) for silent session renewal.
- **🗄️ Soft Deletes & Trash Console**: `isDeleted` flag protection with Admin Trash Console for restoring (`PUT /restore`) or purging (`DELETE /purge`) records.
- **🌐 API Versioning & HATEOAS Envelope**: Legacy `/api/v1/students` and structured `/api/v2/students` with metadata & pagination links.
- **⚡ In-Memory RAM Caching Engine**: Custom TTL RAM Cache with instant responses (`X-Cache: HIT`) and automatic invalidation.
- **🔀 Asynchronous Background Task Queue**: Non-blocking queue engine for audit logging without delaying HTTP controller responses.
- **🏎️ Compound Database Indexes & Query Benchmark**: Optimized MongoDB indexes (`{ department: 1, age: -1 }`) and `.explain('executionStats')` endpoint.
- **🛡️ Security Hardening & DDoS Guard**: `helmet` HTTP headers and `express-rate-limit` (100 req / 15 mins).
- **📜 Immutable Audit Trail**: `AuditLog` collection recording admin CRUD actions.
- **📊 CSV Export & File Uploads**: One-Click CSV Data Export & Multer upload route (`/uploads`).
- **✨ Premium UI/UX Aesthetics**: Liquid Metal WebGL Shader buttons, Apple Hello stroke splash overlay, 3D workspace deck flip.

---

## 🛠️ Quick Start

### 1. Run Locally
```bash
git clone https://github.com/gagan-aditya01/EduBase.git
npm install
cd frontend && npm install && cd ..

# Run backend (Port 5050) & frontend (Port 5173)
node backend/src/server.js
cd frontend && npm run dev
```

### 2. Run with Docker Compose
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:3000` | **Backend API**: `http://localhost:5050` | **MongoDB**: `localhost:27017`

### 3. Run Automated Integration Tests
```bash
npm test
```
*Executes Jest + Supertest suites with 100% pass rate.*

---

## 👥 Core Engineering Team

<div align="center">

<table>
  <tr>
    <td align="center" width="50%">
      <a href="https://github.com/YashwanthReddyPuli">
        <img src="https://raw.githubusercontent.com/gagan-aditya01/EduBase/main/Teams/member1.jpg" width="130px" style="border-radius: 50%; object-fit: cover; aspect-ratio: 1/1;" alt="Yashwanth Profile Photo"/>
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
        <img src="https://raw.githubusercontent.com/gagan-aditya01/EduBase/main/Teams/member2.jpg" width="130px" style="border-radius: 50%; object-fit: cover; aspect-ratio: 1/1;" alt="Gagan Aditya Profile Photo"/>
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
