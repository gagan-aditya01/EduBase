# 🎓 EduBase ERP - Enterprise University Resource Planning System

A modern, production-grade Enterprise University Resource Planning (ERP) System built with **Node.js, Express, MongoDB Atlas, React 18, TypeScript, Tailwind CSS, Recharts, Framer Motion, and Docker**.

[![Git Commit](https://img.shields.io/github/last-commit/gagan-aditya01/EduBase?style=flat-square&color=blue)](https://github.com/gagan-aditya01/EduBase.git)
[![Docker Support](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white)](https://github.com/gagan-aditya01/EduBase.git)
[![Automated Tests](https://img.shields.io/badge/Jest-100%25_Passing-brightgreen?style=flat-square&logo=jest)](https://github.com/gagan-aditya01/EduBase.git)

---

## 🌟 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, `@paper-design/shaders` |
| **Backend** | Node.js, Express 5, Mongoose, Dual JWT Auth, `bcryptjs`, `multer`, User-Isolated RAM Cache |
| **Database** | MongoDB Atlas / MongoDB Local (Relational Mongoose `.populate()`, Aggregation Pipelines) |
| **Testing** | Jest, Supertest (100% Passing Automated Integration Tests) |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 🏛️ System Architecture & ERP Portals

### 1. 🎓 Student Self-Service ERP Portal
- **Reverse-ID Authentication**: Registration ID (*e.g., `231001`*) as Username and Reverse Registration ID (*e.g., `100132`*) as Password.
- **Active Enrolment Dashboard**: Displays student metadata, academic year, department, section, cumulative CGPA badge, and current active enrolled curriculum courses.
- **Year-Wise Academic Performance Sheets**: Evaluates completed academic years (`courseYear < studentYear`) with individual Year SGPA calculations.
- **Official Certified Transcript & PDF Export**: Consolidated academic summary with one-click print and PDF export.

### 2. 👨‍🏫 Faculty Academic Gradebook Console
- **Department-Scoped Directory**: Department isolation restricting faculty view strictly to students within their assigned department (*e.g. Mathematics, Computer Science*).
- **Indian Grading Engine & Gradebook Console**: Section-based grade evaluation (*Assign 1 [20], Midterm [50], Assign 2 [20], EndSem [100]*) with automatic letter grade calculation (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`) and weighted score percentages.
- **Section Live Search & Performance Bar**: Live search by Student Name or Registration ID with dynamic grade tier badges.

### 3. 🛡️ Administrator Governance & Compliance Suite
- **Faculty Directory Management**: Admin console for provisioning faculty staff accounts with assigned department scoping and automated 4-digit ID credentials.
- **Immutable System Audit Trail**: Enterprise audit logger tracking user actions, student record mutations, role updates, and system events.
- **Soft Delete & Recovery Console**: Non-destructive data protection with Admin Trash Bin recovery or permanent purge.
- **Bulk CSV Batch Importer**: Drag-and-drop CSV batch import engine with validation.

### 4. 📊 Analytics Engine & Performance Metrics
- **Real-Time Department Aggregation**: MongoDB multi-faceted aggregation pipelines (`$group`, `$facet`, `$bucket`) powering enrolment statistics, age distribution, and department growth trends.

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
# Install root dependencies
npm install

# Install frontend dependencies
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
# Terminal 1: Run Backend ERP Server (Port 5050)
node backend/src/server.js

# Terminal 2: Run Frontend Dev Client (Port 5173)
cd frontend
npm run dev
```

---

## 🐳 Running with Docker & Docker Compose

Launch the complete ERP stack (**Backend API + React Client + Local MongoDB**) with a single command:

```bash
docker-compose up --build
```

- **Frontend ERP Client**: `http://localhost:3000`
- **Backend ERP API**: `http://localhost:5050`
- **MongoDB Database**: `localhost:27017`

---

## 🧪 Automated Testing

Run the automated Jest + Supertest integration test suite:

```bash
npm test
```

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
