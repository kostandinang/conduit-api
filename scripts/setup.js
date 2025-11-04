#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

console.log('\n🚀 Conduit Setup Wizard\n');
console.log('This will help you create your .env file with Supabase credentials.\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to reconfigure, delete .env and run this again.\n');
  rl.close();
  process.exit(0);
}

console.log('📋 You\'ll need the following from your Supabase project:');
console.log('   1. Go to https://supabase.com/dashboard');
console.log('   2. Select your project (or create a new one)');
console.log('   3. Go to Settings -> API\n');

const questions = [
  {
    key: 'SUPABASE_URL',
    prompt: '🔗 Supabase URL (e.g., https://xxxxx.supabase.co): ',
  },
  {
    key: 'SUPABASE_ANON_KEY',
    prompt: '🔑 Supabase Anon Key: ',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    prompt: '🔐 Supabase Service Role Key: ',
  },
  {
    key: 'DATABASE_URL',
    prompt: '💾 Database URL (Settings -> Database -> Connection String -> URI): ',
  },
];

const answers = {};
let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    // Ask about optional OpenAI key
    rl.question(
      '\n🤖 OpenAI API Key (optional, press Enter to skip): ',
      (answer) => {
        if (answer.trim()) {
          answers['OPENAI_API_KEY'] = answer.trim();
        }
        createEnvFile();
        rl.close();
      }
    );
    return;
  }

  const question = questions[currentQuestion];
  rl.question(question.prompt, (answer) => {
    if (!answer.trim()) {
      console.log('❌ This field is required!');
      askQuestion();
      return;
    }
    answers[question.key] = answer.trim();
    currentQuestion++;
    askQuestion();
  });
}

function createEnvFile() {
  let envContent = '';

  // Add required variables
  envContent += `# Supabase Configuration\n`;
  envContent += `SUPABASE_URL=${answers.SUPABASE_URL}\n`;
  envContent += `SUPABASE_ANON_KEY=${answers.SUPABASE_ANON_KEY}\n`;
  envContent += `SUPABASE_SERVICE_ROLE_KEY=${answers.SUPABASE_SERVICE_ROLE_KEY}\n\n`;

  envContent += `# Database Configuration\n`;
  envContent += `DATABASE_URL=${answers.DATABASE_URL}\n\n`;

  if (answers.OPENAI_API_KEY) {
    envContent += `# OpenAI Configuration\n`;
    envContent += `OPENAI_API_KEY=${answers.OPENAI_API_KEY}\n\n`;
  } else {
    envContent += `# OpenAI Configuration (optional - will use mock responses)\n`;
    envContent += `# OPENAI_API_KEY=sk-your-openai-key\n\n`;
  }

  envContent += `# Server Configuration\n`;
  envContent += `PORT=3000\n`;
  envContent += `NODE_ENV=development\n`;

  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ .env file created successfully!\n');
  console.log('📝 Next steps:');
  console.log('   1. Run database migrations in Supabase SQL Editor');
  console.log('      (See migrations/001_initial_schema.sql)');
  console.log('   2. Start the API server: npm run dev');
  console.log('   3. Start the workers: npm run worker\n');
  console.log('🎉 You\'re all set!\n');
}

// Start the wizard
askQuestion();
