require('dotenv').config();
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("DELETE FROM auth.users WHERE email = 'admin@abwcurious.com'");
    console.log('Deleted admin user via SQL');
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }

  console.log('Creating user via Supabase JS...');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@abwcurious.com',
    password: 'Admin@ABWcurious#2026',
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });
  if (error) {
    console.error('Create User Error:', error);
  } else {
    console.log('Successfully created admin:', data.user.email);
  }
})();
