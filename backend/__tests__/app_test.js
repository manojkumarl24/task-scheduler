const request = require('supertest');
const app = require('../src/index'); 


describe('GET /test', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
