const request = require('supertest');
const app = require('../backend/src/app');
const connectDB = require('../backend/src/db');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

jest.setTimeout(30000);

describe('Full-Stack Backend API Tests', () => {
  let adminToken = '';
  let refreshToken = '';

  beforeAll(async () => {
    // 1. Ensure DB connection is established first
    await connectDB();
    try {
      await mongoose.connection.collection('users').dropIndex('email_1');
    } catch (e) {
      // Ignore
    }

    // 2. Register test admin user
    const username = `adm_${Date.now()}`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ username, password: 'password123', role: 'admin' });

    adminToken = regRes.body.token;
    refreshToken = regRes.body.refreshToken;
  });

  afterAll(async () => {
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
  });

  describe('Validation Error Tests', () => {
    beforeAll(async () => {
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
    });
  });

  describe('API v2 & Soft Delete & Refresh Token Tests', () => {
    it('POST /api/auth/refresh should issue new access token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('GET /api/v2/students should return API v2 envelope contract', async () => {
      const res = await request(app)
        .get('/api/v2/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('apiVersion', '2.0');
      expect(res.body).toHaveProperty('metadata');
      expect(res.body).toHaveProperty('_links');
    });

    it('GET /api/v1/students/trash/list should return soft-deleted student console array', async () => {
      const res = await request(app)
        .get('/api/v1/students/trash/list')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/v1/audit-logs without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/audit-logs');
      expect(res.statusCode).toEqual(401);
    });

    it('GET /api/v1/audit-logs with admin token should return audit trail logs', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Phase 2: Fine-Grained RBAC & Faculty Department Scoping Tests', () => {
    let facultyToken = '';
    const facultyUsername = `fac_${Date.now()}`;

    beforeAll(async () => {
      // 1. Register a faculty user via admin
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username: facultyUsername, password: 'password123', role: 'faculty' });

      const facUserObj = regRes.body;
      facultyToken = facUserObj.token;

      // 2. Admin assigns department 'Computer Science' to faculty user
      await request(app)
        .put(`/api/auth/users/${facUserObj._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'faculty', assignedDepartment: 'Computer Science' });
    });

    it('Faculty should successfully create student in assigned department (Computer Science)', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          studentId: `FAC_CS_${Date.now()}`,
          name: 'CS Faculty Student',
          age: 21,
          department: 'Computer Science',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('department', 'Computer Science');
    });

    it('Faculty should be rejected when creating student outside assigned department (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          studentId: `FAC_OTHER_${Date.now()}`,
          name: 'Non-CS Student',
          age: 22,
          department: 'Philosophy',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Access denied');
    });
  });

  describe('Phase 3: Advanced Analytics Engine & Demographic Metrics Tests', () => {
    it('GET /api/v1/students/analytics/stats should return MongoDB aggregation stats ($facet, $bucket, overall)', async () => {
      const res = await request(app)
        .get('/api/v1/students/analytics/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('departmentBreakdown');
      expect(res.body).toHaveProperty('ageDemographics');
      expect(res.body).toHaveProperty('overall');
      expect(res.body).toHaveProperty('totalTrash');
      expect(res.body).toHaveProperty('userRoleCounts');
      expect(Array.isArray(res.body.departmentBreakdown)).toBe(true);
      expect(Array.isArray(res.body.ageDemographics)).toBe(true);
    });
  });

  describe('Phase 4: Bulk CSV Drag-and-Drop Importer & Batch Validator Tests', () => {
    it('POST /api/v1/students/bulk-import should batch insert valid student array payload', async () => {
      const res = await request(app)
        .post('/api/v1/students/bulk-import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          students: [
            { studentId: `BULK_1_${Date.now()}`, name: 'Bulk Test One', age: 21, department: 'Computer Science', year: '3rd Year', section: '3CS' },
            { studentId: `BULK_2_${Date.now()}`, name: 'Bulk Test Two', age: 22, department: 'Robotics', year: '2nd Year', section: '2ROB' },
          ],
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('importedCount');
      expect(res.body.importedCount).toBeGreaterThanOrEqual(1);
    });
  });
});
