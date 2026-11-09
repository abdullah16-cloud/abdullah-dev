import bcrypt from 'bcryptjs';
import { pool } from './src/db/pool.js';
import { authService } from './src/services/auth.service.js';

async function main() {
  const email = 'admin@hondabikes.pk';
  const password = 'Admin@Honda2026!';

  const existing = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [email]);
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5, 1)',
      ['Store Administrator', email, '03001234567', hash, 'admin']
    );
    console.log('ADMIN_CREATED: Successfully inserted admin user.');
  } else {
    console.log('ADMIN_EXISTED: Admin account already exists.');
  }

  // Verify login using actual authService
  const loginRes = await authService.login({ email, password });
  console.log('LOGIN_VERIFIED:', {
    id: loginRes.user.id,
    email: loginRes.user.email,
    role: loginRes.user.role,
    authenticated: Boolean(loginRes.token),
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
