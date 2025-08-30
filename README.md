# Secure Authentication System

A secure Node.js authentication system using JWT tokens with refresh functionality.

## Features

- JWT token authentication
- Secure password hashing with bcrypt.js
- Input validation and sanitization
- Rate limiting and security headers
- Token refresh functionality
- Protected routes and authorization
- User registration and login
- Secure session management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/auth-system
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Logout user

### Protected Routes
- GET /api/protected/profile - Get user profile
- PUT /api/protected/profile - Update user profile

## Security Features

- Password hashing with bcrypt.js (10 rounds)
- JWT token validation middleware
- Input validation and sanitization
- Rate limiting per IP address
- Helmet.js security headers
- CORS protection
- Token refresh mechanism
- Secure session management# project_0
