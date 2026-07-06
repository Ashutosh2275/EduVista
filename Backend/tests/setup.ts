import dotenv from 'dotenv';

// Force test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/eduvista_test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_123456789_long_enough';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_123456789_long_enough';
process.env.JWT_ACCESS_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE_DAYS = '7';
process.env.SMTP_HOST = 'smtp.mailtrap.io';
process.env.SMTP_PORT = '2525';
process.env.SMTP_USER = 'test_user';
process.env.SMTP_PASS = 'test_pass';

dotenv.config();

// Global jest timeout
jest.setTimeout(30000);
