# 🎓 EduBase - Full-Stack Student & Faculty Management Portal

A modern, production-grade full-stack web application built with **Node.js, Express, MongoDB Atlas, React 18, TypeScript, Tailwind CSS, Recharts, Framer Motion, and Docker**.

[![Git Commit](https://img.shields.io/github/last-commit/gagan-aditya01/EduBase?style=flat-square&color=blue)](https://github.com/gagan-aditya01/EduBase.git)
[![Docker Support](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white)](https://github.com/gagan-aditya01/EduBase.git)
[![Automated Tests](https://img.shields.io/badge/Jest-100%25_Passing-brightgreen?style=flat-square&logo=jest)](https://github.com/gagan-aditya01/EduBase.git)

---

## 🌟 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, `@paper-design/shaders` |
| **Backend** | Node.js, Express 5, Mongoose, Dual JWT Auth, `bcryptjs`, `multer`, RAM Cache |
| **Database** | MongoDB Atlas / MongoDB Local (Relational Mongoose `.populate()`, Aggregation Pipelines) |
| **Testing** | Jest, Supertest (100% Passing Automated Integration Tests) |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 🚀 Key Features & Concepts Implemented

### 1. 🛡️ Fine-Grained Role-Based Access Control (RBAC) & OAuth 2.0
- **Admin Role**: Full system control (Student & Faculty CRUD, faculty creation, user role management, soft-delete recovery, audit trails, and global enterprise analytics).
- **Faculty Role**: Department-scoped workspace. Faculty can add students within their assigned department (*e.g. Computer Science*), view department-scoped analytics, and manage their profile. Restricted from editing/deleting students or accessing the global faculty directory.
- **Guest Role**: Read-only directory access for public browsing.
- **Dual-Token Session Auth**: Access Tokens + Long-lived Refresh Tokens (`POST /api/v1/auth/refresh`) for silent session renewal.
- **Social Login**: Integrated **Google** & **GitHub** OAuth single sign-on (`POST /api/v1/auth/social`).

### 2. 📊 Academic Analytics Engine & Stock Trend Chart
- **Global Enterprise Analytics**: Real-time department student pie charts, faculty staff distribution, and interactive Stock Growth Area Chart with dynamic department filter (`All Departments`, `CS`, `EE`, `ME`, `ADSE`, `MATH`, `ROB`).
- **Faculty Department Analytics Portal**: Dedicated department-scoped analytics engine restricting faculty view strictly to their assigned department's section breakdown pie chart and year-over-year enrolment growth.
- **Interactive Pie Chart Hover Animations**: Custom Recharts `<Sector>` slice pop-out animations (`outerRadius + 14`) with solid, flicker-free label rendering.

### 3. 👨‍🏫 Faculty Directory & Automated Credentials
- **Faculty Management**: Admin console for creating faculty accounts with assigned department scoping (`POST /api/auth/faculty`).
- **Automated Faculty ID & Password Rules**: Faculty accounts receive a unique 4-digit numeric ID (*e.g. `4001`*) and initial password set to reversed numeric ID (*e.g. `1004`*).
- **KPI Summary Cards**: Top status cards displaying **Total Staff** count and **Active Staff** status.

### 4. 🗂️ Relational Data Modeling & Auto Section Naming
- **Mongoose Relational Joins**: Dedicated `Department` collection populated dynamically via `departmentRef` (`.populate('departmentRef', 'name code')`).
- **Automated Section Code Generation**: Automatically formats sections as `{YearNumber}{ShortDept}` (*e.g., `3CS`, `2EE`, `4ME`*) based on joining year and department.
- **Automated Student ID Format**: Generates serial registration IDs formatted as `{2-digit joining year}{5-digit serial}` (*e.g., `2361001`, `2462001`*).

### 5. 🗄️ Soft Deletes & Admin Trash Recovery Console
- **Soft Delete Protection**: Setting `isDeleted: true` and `deletedAt: Date` prevents accidental database data loss.
- **Trash Bin Console**: Admin endpoints to list (`GET /trash/list`), restore (`PUT /restore`), or permanently purge (`DELETE /purge`) records.

### 6. ⚡ High-Performance Caching & Async Task Queue
- **MongoDB Aggregation Pipelines**: Multi-faceted analytics engine (`$group`, `$facet`, `$bucket`) powering demographic metrics (`GET /api/v1/students/analytics/stats`).
- **In-Memory RAM Cache Engine**: Custom TTL cache returning sub-millisecond responses (`X-Cache: HIT` / `MISS`) with automatic invalidation on record mutation.
- **Async Background Task Queue**: Non-blocking queue engine offloading audit logging without delaying HTTP controller responses.

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

# Install frontend dependencies (Vite, React, Tailwind, Framer Motion, Recharts)
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
- `RBAC & Scoping Tests`: Faculty Department Creation Scoping & Admin-Only Audit Logs (200 OK / 403 Forbidden)

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
