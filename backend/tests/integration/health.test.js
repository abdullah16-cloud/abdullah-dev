import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { app } from '../../src/app.js';

describe('Health Check Endpoint (/api/health)', () => {
  it('returns health payload without revealing connection strings or internal errors', async () => {
    const res = await request(app).get('/api/health');

    // If DB is up: 200, if down: 503
    expect([200, 503]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.uptime).toBe('number');
    expect(['up', 'down']).toContain(res.body.data.database);
    expect(['ok', 'degraded']).toContain(res.body.data.status);
    // Ensure no secrets or connection strings leak
    expect(JSON.stringify(res.body)).not.toContain('password');
    expect(JSON.stringify(res.body)).not.toContain('postgresql://');
  });
});
