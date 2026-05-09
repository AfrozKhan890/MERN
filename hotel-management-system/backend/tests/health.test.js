const request = require('supertest');
const { app } = require('../server');

describe('System monitoring endpoints', () => {
  test('GET /api/health should return server health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('mongodb');
  });

  test('GET /api/metrics should return runtime metrics', async () => {
    const response = await request(app).get('/api/metrics');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.metrics).toHaveProperty('totalRequests');
    expect(response.body.metrics).toHaveProperty('uptimeSeconds');
  });
});
