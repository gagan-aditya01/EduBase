# EduBase Portal - Full-Stack Student Management System

EduBase Portal is a full-stack web application designed for student directory management, analytics visualization, real-time activity logging, and administrative account controls.

It combines a **Node.js / Express REST API** backend connected to **MongoDB (Mongoose)** with a **React 18 / Vite** frontend powered by **Tailwind CSS**, **Framer Motion 3D animations**, and canvas shader effects (**Liquid Metal** & **Liquid Glass** visuals).

---

## 🌟 Key Features

- **Authentication & RBAC**:
  - Secure **JWT Token Authentication**.
  - **Role-Based Access Control**:
    - **Admin**: Full CRUD capabilities on students, bulk operations, seed data, user credential management.
    - **Guest**: Read-only directory access and individual profile controls.
- **Student Directory Management**:
  - Full CRUD operations: Create, Read, Update, and Single/Bulk Delete.
  - Advanced multi-parameter search (filter by Student ID, Name, Department, Age Range).
  - Mock dataset seeding trigger for quick testing.
- **Interactive Visualizations & Analytics**:
  - Dynamic **Stats Overview Cards** (Total Students, Department Count, Average Age).
  - **Department Distribution Chart** with interactive visual representations.
- **iOS Profile & Activity Notifications**:
  - Vertical iOS list profile dropdown.
  - Real-time **Activity Log** logging all database CRUD operations with timestamp counters.
  - Self-service password reset menu.
- **Astryx Avatar Guest Console**:
  - Split-grid **Guest Accounts Dashboard Console** for Administrators.
  - Astryx-style vertical stack user directory with live status badges.
  - Canvas-driven **Liquid Metal Buttons** and **Liquid Glass** background effects.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 & Vite
  - Tailwind CSS & Custom Design System
  - Framer Motion (3D Perspective Animations & Spring Physics)
  - Lucide React Icons
  - Paper Design Shaders (Liquid Metal WebGL Shaders)
- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose ORM
  - JSON Web Tokens (JWT) & bcryptjs Password Hashing
  - CORS & Dotenv configuration

---

## 📁 Repository Directory Structure

```text
fullstack_project/
├── backend/
│   ├── .env.example          # Template for backend environment variables
│   └── src/
│       ├── config/           # Database configuration
│       ├── controllers/      # Route controllers (Auth, Students)
│       ├── middlewares/      # JWT protection & Admin RBAC middlewares
│       ├── models/           # Mongoose schemas (Student, User)
│       ├── routes/           # Express API route declarations
│       ├── app.js            # Express application setup
│       ├── db.js             # Mongoose connection logic
│       └── server.js         # Backend entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # React UI Components & Modals
│   │   │   ├── ui/           # Liquid Metal & Liquid Glass Design Primitives
│   │   │   ├── App.tsx       # Main Application Dashboard
│   │   │   ├── AuthPage.tsx  # Auth & Portal Gateway
│   │   │   └── ...
│   │   ├── App.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── .env.example              # Root environment template
├── .gitignore                # Git exclusions (node_modules, .env)
├── package.json              # Root dependencies & package scripts
└── README.md                 # Project Setup & Documentation Guide
```

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
Make sure you have installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB Database** (Either a local MongoDB server or a [MongoDB Atlas Cloud](https://cloud.mongodb.com) cluster)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/gagan-aditya01/EduBase.git
cd EduBase
```

---

### Step 2: Install Dependencies

1. **Install Root & Backend Dependencies**:
   ```bash
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and enter your MongoDB connection string and JWT secret:

```env
PORT=5050
MONGO_URI=mongodb+srv://<your_username>:<your_password>@cluster0.eetzxhw.mongodb.net/edubase?retryWrites=true&w=majority
JWT_SECRET=supersecretkey123
```

> **Note**: If using MongoDB Atlas, ensure your current IP address is whitelisted in your Atlas cluster's **Security -> Network Access** tab.

---

### Step 4: Run the Application

You will need **two terminal tabs/windows**:

#### 1 Terminal 1: Run Backend Server
From the project root directory:
```bash
node backend/src/server.js
```
*(Backend API will run at `http://localhost:5050`)*

#### 2 Terminal 2: Run Frontend Dev Server
From the project root directory:
```bash
cd frontend
npm run dev
```
*(Frontend application will open at `http://localhost:5173` or `http://localhost:5174`)*

---

## ❓ Common Troubleshooting & Gotchas

### 1 `Cannot find module .../backend/server.js`
- **Cause**: Running `node backend/server.js` instead of the correct path.
- **Fix**: The entry file is located inside `src/`. Run:
  ```bash
  node backend/src/server.js
  ```

### 2 `Cannot find module '/npm'`
- **Cause**: Running `node npm run dev` instead of executing `npm` directly.
- **Fix**: Do not prefix `npm` with `node`. Run:
  ```bash
  cd frontend
  npm run dev
  ```

### 3 `MongoDB Atlas IP Whitelist Error`
- **Cause**: Your current IP is not authorized on MongoDB Atlas.
- **Fix**: Log into [MongoDB Atlas](https://cloud.mongodb.com), go to **Network Access**, and click **Add Current IP Address** (or `0.0.0.0/0` for development).

---

## 📡 API Reference Overview

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`admin` or `guest`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `PUT` | `/api/auth/profile/password` | User (Token) | Update self profile password |
| `GET` | `/api/auth/users` | Admin Only | List all registered guest accounts |
| `PUT` | `/api/auth/users/:userId` | Admin Only | Reset a specific guest password |
| `DELETE` | `/api/auth/users/:userId` | Admin Only | Permanently delete a guest account |

### Student Directory Routes (`/api/students`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | User (Token) | Fetch student list with optional search filters |
| `GET` | `/api/students/:studentId` | User (Token) | Fetch details for a specific student |
| `POST` | `/api/students` | Admin Only | Create a new student record |
| `PUT` | `/api/students/:studentId` | Admin Only | Update an existing student record |
| `DELETE` | `/api/students/:studentId` | Admin Only | Delete a student record |

---

## 📄 License
Distributed under the ISC License.
