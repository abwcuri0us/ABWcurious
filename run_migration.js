const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
  }
  
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    console.log('Adding country and city to profiles...');
    await client.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
    `);
    console.log('Successfully updated profiles schema');

    console.log('Granting permissions to case_studies...');
    await client.query(`
      GRANT SELECT ON public.case_studies TO anon, authenticated;
    `);
    console.log('Successfully updated case_studies permissions');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

runMigration();
