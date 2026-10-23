import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Reading SQL file...");
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'supabase/create_courses_tables.sql'), 'utf-8');
  
  // Note: supabase-js doesn't have a direct way to run raw SQL unless using rpc.
  // But we can try to use a postgres client if needed.
  console.log("Please run this SQL directly in the Supabase SQL editor or use psql.");
}

run();
