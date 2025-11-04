#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('\n❌ Error: .env file not found!\n');
  console.error('📝 Please create a .env file in the project root.');
  console.error('   You can copy from .env.example:\n');
  console.error('   cp .env.example .env\n');
  console.error('   Then fill in your Supabase credentials.\n');
  console.error('💡 Run `npm run setup` for interactive setup.\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
];

const missingVars = requiredVars.filter(varName => {
  const hasVar = envContent.includes(`${varName}=`);
  const hasPlaceholder = envContent.includes(`${varName}=your-`) ||
                          envContent.includes(`${varName}=https://your-`);
  return !hasVar || hasPlaceholder;
});

if (missingVars.length > 0) {
  console.error('\n⚠️  Warning: Some environment variables may not be configured:\n');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n📝 Make sure to replace placeholder values with your actual Supabase credentials.');
  console.error('   Get them from: https://supabase.com/dashboard\n');
  // Don't exit - let the app try to run and show more detailed errors
}
