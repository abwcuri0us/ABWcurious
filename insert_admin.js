require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;');
    await client.query('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;');
    console.log('Altered profiles table');
    // Now retry insert
    const res = await client.query(`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role) 
      VALUES (
        gen_random_uuid(), 
        '00000000-0000-0000-0000-000000000000', 
        'admin@abwcurious.com', 
        crypt('Admin@ABWcurious#2026', gen_salt('bf')), 
        now(), 
        '{"provider":"email","providers":["email"]}', 
        '{"name":"Admin","role":"admin"}', 
        now(), 
        now(), 
        'authenticated', 
        'authenticated'
      )
      RETURNING id, email;
    `);
    console.log('Inserted admin user:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
})();
