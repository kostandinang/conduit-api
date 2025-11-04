import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
	console.warn('Warning: .env file not found or could not be loaded');
	console.warn('Looking for .env at:', envPath);
	console.warn('Make sure to copy .env.example to .env and fill in your credentials');
}

export const config = {
	supabase: {
		url: process.env.SUPABASE_URL || '',
		anonKey: process.env.SUPABASE_ANON_KEY || '',
		serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
	},
	database: {
		url: process.env.DATABASE_URL || '',
	},
	openai: {
		apiKey: process.env.OPENAI_API_KEY,
	},
	server: {
		port: parseInt(process.env.PORT || '3000'),
		env: process.env.NODE_ENV || 'development',
	},
};

const requiredEnvVars = [
	'SUPABASE_URL',
	'SUPABASE_ANON_KEY',
	'SUPABASE_SERVICE_ROLE_KEY',
	'DATABASE_URL',
];

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
	console.error('\n❌ Missing required environment variables:');
	missingVars.forEach((envVar) => console.error(`   - ${envVar}`));
	throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}
