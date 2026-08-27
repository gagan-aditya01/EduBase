const request = require('supertest');
const app = require('../backend/src/app');

describe('Full-Stack Backend API Tests', () => {
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
});
