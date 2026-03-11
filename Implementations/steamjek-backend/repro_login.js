const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testLogin() {
  const email = 'test@example.com';
  const password = 'password123';

  try {
    console.log('Testing login for:', email);
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('User found:', result.rows.length > 0);
    if (result.rows.length === 0) return;

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);

    if (!validPassword) return;

    console.log('Generating token with secret:', process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Token generated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Login test failed with error:', err);
    process.exit(1);
  }
}

testLogin();
