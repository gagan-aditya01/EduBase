# 🎓 EduBase ERP - Enterprise Academic Management Portal

EduBase is a full-stack Enterprise Resource Planning (ERP) platform built for universities and higher education institutions. It streamlines student lifecycle management, faculty administration, section gradebooks, continuous attendance tracking, and academic analytics within a secure, multi-tenant environment.

Built with **React 18, TypeScript, Node.js, Express, MongoDB Atlas, Tailwind CSS, Recharts, Framer Motion, and Docker**.

[![Git Commit](https://img.shields.io/github/last-commit/gagan-aditya01/EduBase?style=flat-square&color=blue)](https://github.com/gagan-aditya01/EduBase.git)
[![Docker Support](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white)](https://github.com/gagan-aditya01/EduBase.git)
[![Automated Tests](https://img.shields.io/badge/Jest-100%25_Passing-brightgreen?style=flat-square&logo=jest)](https://github.com/gagan-aditya01/EduBase.git)

---

## 🛠️ Technology Stack

| Architecture Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, `@paper-design/shaders` |
| **Backend API** | Node.js, Express 5, Mongoose ORM, Dual-Token JWT Authentication (`bcryptjs`), Multer |
| **Database** | MongoDB Atlas (Relational Data Modeling via `.populate()`, Multi-Stage Aggregations) |
| **Performance & Caching** | User-Isolated Memory Caching (`X-Cache` Headers), Non-Blocking Event Queues, SSE Streams |
| **Testing & CI/CD** | Jest, Supertest Automated Integration Suite (100% Endpoint Coverage) |
| **DevOps & Containers** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## ✨ System Modules & Features

### 🎓 Student Self-Service Portal
- **Student Authentication**: Secure sign-in using Registration ID and reverse-ID security credentials.
- **Active Academic Dashboard**: Displays profile metadata, cumulative CGPA status, and currently enrolled curriculum courses.
- **Academic Performance Sheets**: Displays year-wise mark sheets (1st Year, 2nd Year, 3rd Year) with calculated Year SGPA for completed academic years.
- **Official Certified Transcripts**: One-click generation of printable university academic transcripts with digital signature verification by Controller of Examinations.
- **Personal Attendance Tracking**: Student self-service console displaying total conducted hours, present hours, cumulative attendance percentage badge, and exam eligibility indicator ($\ge 75\%$).

### 👨‍🏫 Faculty Academic Console
- **Department-Scoped Workspace**: Department isolation restricting faculty members strictly to assigned sections and department rosters.
- **Gradebook Evaluation Engine**: Section-based gradebook supporting weighted evaluation (*Assignment 1, Midterm, Assignment 2, End-Semester*) with automatic letter grade resolution (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`).
- **Section Attendance Marking**: Session-based attendance marking featuring `Present` and `Absent` toggles, `Mark All` shortcuts, continuous 1-hour and 2-hour block period selection, and live display of student current attendance percentages.
- **Live Class Performance Analytics**: Real-time evaluation summary featuring class average scores, pass rate percentages, and dynamic grade distribution badges.

### 🛡️ Administrator ERP Governance
- **System Attendance Inspector**: Department-wide overall attendance monitoring console displaying cumulative attendance statistics (`totalPresentHours / totalConductedHours`), percentage badges, and exam eligibility status.
- **Faculty Directory Management**: Complete faculty staff management console supporting account creation, department assignment, and automated numeric ID generation.
- **System Audit Trail**: Real-time audit logging tracking user sign-ins, profile edits, mark submissions, and security events.
- **Soft Delete & Data Recovery**: Non-destructive record protection with an Admin Trash Console for restoring or permanently purging records.
- **Batch CSV Data Import**: Drag-and-drop CSV importer with automated data validation and error handling.

### 📊 Enterprise Analytics & Reporting
- **Real-Time Analytics Dashboard**: Visual analytics powered by MongoDB aggregation pipelines, featuring department enrolment distributions, age demographics, and academic trend charts.
- **Real-Time Event Telemetry**: Server-Sent Events (SSE) broadcasting live student updates and grade submissions across active user sessions.

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas Cluster URI or local MongoDB server (`mongodb://localhost:27017/edubase`)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/gagan-aditya01/EduBase.git
cd EduBase

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file inside `backend/`:
```env
PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edubase?retryWrites=true&w=majority
JWT_SECRET=supersecretkey123
JWT_REFRESH_SECRET=supersecretrefreshkey456
```

### 3. Start Development Servers
```bash
# Start Backend API Server (Port 5050)
node backend/src/server.js

# Start Frontend Dev Server (Port 5173)
cd frontend
npm run dev
```

---

## 🐳 Running with Docker

Deploy the complete stack (**Backend API, React Frontend, Local MongoDB**) using Docker Compose:

```bash
docker-compose up --build
```

- **Frontend Client**: `http://localhost:3000`
- **Backend API Service**: `http://localhost:5050`
- **MongoDB Instance**: `localhost:27017`

---

## 🧪 Automated Testing

Execute the Jest + Supertest automated API integration test suite:

```bash
npm test
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
 available under the [MIT License](LICENSE).
