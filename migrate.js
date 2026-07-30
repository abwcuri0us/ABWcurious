const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
  const connectionString = 'postgresql://postgres.hvgoebkewxgihklghjjk:ABWcurious2026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to DB');
    const sql = fs.readFileSync('supabase/migrations/002_add_forms_and_case_studies.sql', 'utf8');
    await client.query(sql);
    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await client.end();
  }
}

runMigration();
