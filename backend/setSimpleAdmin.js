import bcrypt from 'bcryptjs';
import { pool } from './src/db/pool.js';
import { authService } from './src/services/auth.service.js';

async function main() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 12);

  const emails = ['admin@hondabikes.pk', 'admin@admin.com'];

  for (const email of emails) {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (full_name, email, phone, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5, 1)',
        ['Store Administrator', email, '03001234567', hash, 'admin']
      );
      console.log(`Inserted ${email} with password: ${password}`);
    } else {
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2, is_active = 1 WHERE email = $3',
        [hash, 'admin', email]
      );
      console.log(`Updated ${email} with password: ${password}`);
    }

    // Verify login
    const res = await authService.login({ email, password });
    console.log(`Verified login for ${email}: role = ${res.user.role}, token generated = ${Boolean(res.token)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED:', e);
    process.exit(1);
  });
