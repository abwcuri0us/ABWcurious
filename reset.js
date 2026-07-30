require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(`
      UPDATE auth.users 
      SET encrypted_password = crypt('Admin@ABWcurious#2026', gen_salt('bf')) 
      WHERE email = 'admin@abwcurious.com'
      RETURNING id, email;
    `);
    console.log('Update result:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
})();
