const { Client } = require('pg');

async function runMigration() {
  const connectionString = 'postgresql://postgres.hvgoebkewxgihklghjjk:ABWcurious2026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query(`
      DROP TABLE IF EXISTS public.case_studies CASCADE;

      CREATE TABLE public.case_studies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        cover_image TEXT,
        client_name TEXT,
        industry TEXT,
        challenge TEXT,
        solution TEXT,
        results TEXT, -- Or JSONB if it's stored as JSON
        tags TEXT[],
        is_published BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Case studies recreated successfully.');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await client.end();
  }
}

runMigration();
