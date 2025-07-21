# Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create environment file:
```bash
# Create .env file in backend directory
touch .env
```

3. Add the following to your `.env` file:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database Configuration (if using external database)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=todolist_db
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password

# Google OAuth (if using Google Sign-In)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Running the Server

1. Start the server:
```bash
npm start
# or
node server.js
```

2. The server will run on `http://localhost:3000`

3. API endpoints will be available at `http://localhost:3000/api`

## Authentication Fixes Applied

The following issues have been fixed:

1. **Frontend Authentication Context**: Removed fallback mock authentication that allowed login with any credentials
2. **Backend Authentication**: Fixed password validation logic in signIn function
3. **Token Generation**: Added fallback JWT secret for development
4. **Error Handling**: Improved error handling in both frontend and backend
5. **API Response Structure**: Fixed response structure to match expected format

## Testing Authentication

1. Start the backend server
2. Start the frontend app
3. Try to sign up with valid credentials
4. Try to sign in with correct credentials
5. Try to sign in with wrong credentials (should get 401 error)

## Mobile Development

For mobile development, update the API_BASE_URL in frontend:

- **Android Emulator**: `http://10.0.2.2:3000/api`
- **iOS Simulator**: `http://localhost:3000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:3000/api`

## Troubleshooting

1. **401 Unauthorized**: Check if JWT_SECRET is set in .env
2. **Database Connection**: Ensure database is running and accessible
3. **Network Issues**: Check if backend is running on correct port
4. **Mobile Connection**: Ensure correct IP address is used for mobile development 