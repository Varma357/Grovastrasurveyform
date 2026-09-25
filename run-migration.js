/**
 * Grovastra - Direct Postgres Migration Runner
 * Run: node run-migration.js
 * Pass DB password as env var: DB_PASSWORD=yourpassword node run-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'mhobqyopenupymciziim';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

if (!DB_PASSWORD) {
  console.log('Usage: DB_PASSWORD=<your-supabase-db-password> node run-migration.js');
  console.log('\nFind your DB password at:');
  console.log('https://supabase.com/dashboard/project/mhobqyopenupymciziim/settings/database');
  process.exit(0);
}

// Read the schema SQL
const schemaPath = path.join(__dirname, 'supabase-schema.sql');
const fullSQL = fs.readFileSync(schemaPath, 'utf8');

async function runMigration(password) {
  // Try both pooler and direct connection
  const configs = [
    {
      host: `db.${PROJECT_REF}.supabase.co`,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: password,
      ssl: { rejectUnauthorized: false },
    },
    {
      host: `aws-0-ap-south-1.pooler.supabase.com`,
      port: 6543,
      database: 'postgres',
      user: `postgres.${PROJECT_REF}`,
      password: password,
      ssl: { rejectUnauthorized: false },
    },
  ];

  for (const config of configs) {
    const client = new Client(config);
    try {
      console.log(`Trying: ${config.host}:${config.port} as ${config.user}`);
      await client.connect();
      console.log('✅ Connected successfully!');
      
      // Run the full schema
      console.log('Running schema...');
      await client.query(fullSQL);
      console.log('✅ Schema created successfully!');
      
      // Verify
      const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
      console.log('Tables created:', res.rows.map(r => r.table_name).join(', '));
      
      await client.end();
      return true;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
      try { await client.end(); } catch(e) {}
    }
  }
  return false;
}

runMigration(DB_PASSWORD).then(ok => {
  if (!ok) {
    console.log('\n⚠️  Could not connect automatically.');
    console.log('Please run the schema manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/mhobqyopenupymciziim/sql/new');
    console.log('2. Paste contents of: supabase-schema.sql');
    console.log('3. Click Run');
  }
}).catch(console.error);
