const { Client } = require('pg');

async function runMigration() {
  const connectionString = 'postgresql://postgres.hvgoebkewxgihklghjjk:ABWcurious2026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query(`
      ALTER TABLE public.research_inquiries RENAME COLUMN topic TO research_topic;
      ALTER TABLE public.research_inquiries RENAME COLUMN message TO description;
      ALTER TABLE public.research_inquiries ADD COLUMN IF NOT EXISTS collaboration_type TEXT;
    `);
    console.log('Research inquiries altered successfully.');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await client.end();
  }
}

runMigration();
