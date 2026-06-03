require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  FRONTEND_URL:
    process.env.FRONTEND_URL || 'http://localhost:3000',
};
