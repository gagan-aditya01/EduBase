const request = require('supertest');
const app = require('../backend/src/app');
const connectDB = require('../backend/src/db');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

describe('Full-Stack Backend API Tests', () => {
  beforeAll(async () => {
    // Connect to the database for testing
    await connectDB();
    try {
      await mongoose.connection.collection('users').dropIndex('email_1');
    } catch (e) {
      // Ignore if index doesn't exist
    }
  });

  afterAll(async () => {
    // Disconnect database after tests finish
    await mongoose.connection.close();
  });

  it('GET / should return 200 OK and health status page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Server is Running');
  });

  it('GET /api/students should require authorization token (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('Not authorized');
  });

  it('POST /api/students without auth should reject request (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({
        studentId: '99999',
        name: 'Test Student',
        age: 22,
        department: 'Testing',
      });
    expect(res.statusCode).toEqual(401);
  });

  it('GET /api/unhandled-route should return custom 404 error response', async () => {
    const res = await request(app).get('/api/unhandled-route');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('does not exist on this server');
  });

  describe('Validation Error Tests', () => {
    let adminToken = '';

    beforeAll(async () => {
      // Register or login a test admin to get an auth token
      const username = `admin_${Date.now()}`;
      await request(app)
        .post('/api/auth/register')
        .send({ username, password: 'password123', role: 'admin' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username, password: 'password123' });
      
      adminToken = loginRes.body.token;

      // Seed one student to test duplicates
      await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'STUDENT_DUPE_TEST',
          name: 'Original Student',
          age: 20,
          department: 'Engineering',
        });
    });

    it('POST /api/students with duplicate ID should return 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'STUDENT_DUPE_TEST',
          name: 'Duplicate Student',
          age: 22,
          department: 'Science',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('already exists');
    });

    it('POST /api/students with negative age should return 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'STUDENT_AGE_NEG',
          name: 'Negative Age Student',
          age: -5,
          department: 'Science',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Age must be a number between 16 and 90');
    });

    it('POST /api/students with age too high should return 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'STUDENT_AGE_HIGH',
          name: 'Elderly Student',
          age: 105,
          department: 'Science',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Age must be a number between 16 and 90');
    });
  });
});

