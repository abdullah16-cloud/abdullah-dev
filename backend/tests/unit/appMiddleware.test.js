import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../../src/app.js';

describe('App Middleware & Security Protections', () => {
  it('unknown route returns clean JSON 404 without leaking stack trace', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.stack).toBeUndefined();
  });

  it('malformed JSON payload returns clean 400 INVALID_JSON error without crashing', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .set('Origin', 'http://localhost:5173')
      .send('{"customer": "broken json without closing brace');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_JSON');
    expect(res.body.stack).toBeUndefined();
  });

  it('helmet disables X-Powered-By header to shield server technology stack', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
