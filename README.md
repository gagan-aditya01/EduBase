# 🎓 EduBase ERP - Enterprise Multi-Tenant University ERP Platform

EduBase is a high-throughput, microservices-ready Enterprise University Resource Planning (ERP) platform designed for multi-department academic governance, complex gradebook evaluation, and real-time student self-service telemetry. Built on **Node.js, Express 5, MongoDB Atlas, React 18, TypeScript, Tailwind CSS, Recharts, Framer Motion, and Docker**.

[![Git Commit](https://img.shields.io/github/last-commit/gagan-aditya01/EduBase?style=flat-square&color=blue)](https://github.com/gagan-aditya01/EduBase.git)
[![Docker Support](https://img.shields.io/badge/Docker-Enterprise_Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://github.com/gagan-aditya01/EduBase.git)
[![Automated Tests](https://img.shields.io/badge/Jest-100%25_Passing-brightgreen?style=flat-square&logo=jest)](https://github.com/gagan-aditya01/EduBase.git)

---

## 🌟 Technology Stack & Infrastructure

| Layer | System Components & Frameworks |
| :--- | :--- |
| **Frontend Architecture** | React 18, TypeScript, Vite, Vanilla CSS Design System, Tailwind CSS, Recharts, Framer Motion, `@paper-design/shaders` |
| **Backend Engine** | Node.js Runtime, Express 5 Framework, Mongoose ORM, Dual-Token JWT Security (`bcryptjs`), Async Task Queue, SSE Telemetry |
| **Database Architecture** | MongoDB Atlas / Local MongoDB (Relational Mongoose `.populate()`, Multi-Faceted Aggregation Pipelines) |
| **Performance & Caching** | User-Isolated In-Memory Cache Engine (`X-Cache: HIT/MISS` headers with automatic cache invalidation) |
| **Quality Assurance** | Jest Test Suite, Supertest API Automation (100% End-to-End Integration Passing Coverage) |
| **Containerization** | Docker, Docker Compose, Nginx Container Networking |

---

## ⚡ Key Enterprise ERP System Modules & Technical Capabilities

### 1. 🎓 Student Self-Service Telemetry & Transcript Engine
- **Reverse-Algorithmic Authentication**: Secure student authentication using Registration ID (*e.g., `231001`*) and reverse-string password verification against MongoDB `Student` records with priority routing over standard user tables.
- **Active Enrolment Dashboard**: Dynamic curriculum course matching engine cross-referencing student department and academic year to render active enrolled subjects (*e.g., `CS401`, `CS402`, `CS403`*).
- **Strict Completed Academic Years Evaluation**: Enforces `courseYear < studentYear` relational boundary. Evaluates marks exclusively for completed academic years (*e.g., 3rd-year students access 1st & 2nd-year SGPA sheets only*).
- **Vector-Rendered Certified PDF Transcripts**: Dynamic client-side transcript generator producing official university transcripts with cumulative CGPA computation (`totalGradePointsWeighted / totalCredits`).

### 2. 👨‍🏫 Faculty Academic Gradebook & Evaluation Engine
- **Fine-Grained Department Scoping & Query Isolation**: Department-level isolation enforcing regex boundaries (`new RegExp('^Department$', 'i')`) so faculty members access student records and analytics exclusively within their assigned department.
- **Weighted 100-Point Assessment Formula**:
  $$\text{Weighted Score \%} = \left(\frac{\text{Assign 1}}{20} \times 10\right) + \left(\frac{\text{Midterm}}{50} \times 20\right) + \left(\frac{\text{Assign 2}}{20} \times 10\right) + \left(\frac{\text{EndSem}}{100} \times 60\right)$$
- **Automated Letter Grade Mapping**: Instant letter grade resolution (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`) and 10-point grade scale calculation.
- **Live Performance Analytics Bar**: Real-time evaluation metrics displaying class average, pass rate percentage, and interactive grade distribution badges (`O` to `F`).

### 3. 🛡️ Enterprise Security, Audit Trails & Governance
- **Immutable System Audit Event Stream**: Asynchronous event queue (`BackgroundQueue`) logging all user authentications, student mutations, faculty creations, and security operations to an append-only audit trail.
- **Non-Destructive Soft-Delete & Admin Recovery**: System-wide soft deletion (`isDeleted: true`, `deletedAt: Date`) with Admin Trash Bin console for one-click record restoration or permanent database purging.
- **Automated Faculty Provisioning & 4-Digit Identity Generation**: Admin console generating faculty accounts with auto-assigned 4-digit IDs (*e.g. `4008`*) and reverse-ID initial passwords.
- **User-Isolated High-Performance RAM Cache**: Custom TTL memory cache tagged with `userId` to eliminate cross-session data leaks while maintaining sub-millisecond API responses.

### 4. 📊 Multi-Faceted MongoDB Aggregation Analytics
- **Multi-Pipeline Demographics Engine**: Executes multi-stage Aggregation Pipelines (`$facet`, `$group`, `$bucket`) delivering real-time department enrolment ratios, age distribution buckets, and section performance charts.
- **Real-Time Server-Sent Events (SSE)**: SSE event pipeline broadcasting live student registration and evaluation events to connected client sessions without polling overhead.

---

## 🛠️ Local Development & Deployment

### Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: MongoDB Atlas Cluster URI or local instance (`mongodb://localhost:27017/edubase`)

### 1. Clone & Install
```bash
git clone https://github.com/gagan-aditya01/EduBase.git
cd EduBase

# Install backend dependencies
npm install

# Install frontend client dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Configuration
Create `backend/.env`:
```env
PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edubase?retryWrites=true&w=majority
JWT_SECRET=supersecretkey123
JWT_REFRESH_SECRET=supersecretrefreshkey456
```

### 3. Launch Development Instance
```bash
# Terminal 1: Backend ERP API Server (Port 5050)
node backend/src/server.js

# Terminal 2: Frontend Vite React App (Port 5173)
cd frontend
npm run dev
```

---

## 🐳 Containerized Deployment (Docker & Docker Compose)

Deploy the multi-container production stack (**Node.js Backend + Vite Frontend Client + Local MongoDB Atlas Mirror**) using Docker Compose:

```bash
docker-compose up --build
```

- **ERP Frontend Web Client**: `http://localhost:3000`
- **ERP REST API Service**: `http://localhost:5050`
- **MongoDB Database Container**: `localhost:27017`

---

## 🧪 Integration Testing Suite

Execute the Jest + Supertest API integration suite:

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
