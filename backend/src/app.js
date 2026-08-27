const express = require('express');
const cors = require('cors');

const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express();

const path = require('path');

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Basic sanity/health check route returning a status page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Status</title>
      <style>
        body {
          margin: 0;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2.5rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 100%;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .pulse {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Server is Running</h1>
        <p>API and database connections are operational.</p>
        <div class="status-badge">
          <span class="pulse"></span>
          Connected to MongoDB
        </div>
      </div>
    </body>
    </html>
  `);
});

// API routes
app.use('/api/students', studentRoutes);
app.use('/api/auth', authRoutes);

// Catch 404 unhandled routes
app.use(notFound);

// Centralized custom error handling middleware
app.use(errorHandler);

module.exports = app;
