# AI Waste Sort - Complete Setup Guide

This guide will help you set up and run the complete AI Waste Sort application with all its components.

## Architecture Overview

The application consists of three main components:
1. **Frontend (React + Vite)** - Port 5173
2. **REST API Server (Node.js + Express)** - Port 3000
3. **AI Classification Server (Python + FastAPI)** - Port 8000

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (running locally or cloud instance)

## Step-by-Step Setup

### 1. Install Dependencies

#### Frontend Dependencies
```bash
cd ai-waste-sort
npm install
```

#### Backend Dependencies
```bash
cd backend/base_server
npm install
```

#### Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

#### Backend Environment
Create `.env.development` in `backend/base_server/`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/waste-sort
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```

### 3. Start All Services

You need to run all three services simultaneously. Open 3 terminal windows:

#### Terminal 1: Start Python AI Server
```bash
cd backend
python start_server.py
```
This starts the FastAPI server on port 8000 for AI classification.

#### Terminal 2: Start Node.js REST API Server
```bash
cd backend/base_server
node start_rest_server.js
```
This starts the Express server on port 3000 for user management and data storage.

#### Terminal 3: Start React Frontend
```bash
cd ai-waste-sort
npm run dev
```
This starts the Vite development server on port 5173.

### 4. Verify Setup

1. Open your browser and go to `http://localhost:5173`
2. You should be redirected to the login page (authentication is now required)
3. Create a new account or login with existing credentials
4. Once logged in, go to the Scan page
5. Click "Run Tests" in the API Test component to verify all services are working

## Authentication Flow

The application now implements proper authentication:

1. **Unauthenticated users** are redirected to the login page
2. **After successful login**, users are redirected to the home page
3. **All main pages** (Home, Scan, History, etc.) require authentication
4. **User information** is displayed in the header with logout option

## API Integration

### Classification Workflow

1. **Image Upload**: User uploads image via frontend
2. **AI Processing**: Image sent to Python server (port 8000) for classification
3. **Result Display**: Classification result shown to user
4. **Data Storage**: When user confirms, result saved to MongoDB via REST API (port 3000)
5. **History**: User can view all their classifications in the History page

### API Endpoints

#### Python AI Server (Port 8000)
- `GET /` - Server info
- `GET /health` - Health check
- `POST /scan` - Image classification

#### Node.js REST API (Port 3000)
- `GET /v1/health` - Health check
- `POST /v1/login` - User login
- `POST /v1/register` - User registration
- `POST /v1/classification/classify` - Save classification
- `GET /v1/classification/classify/history/:userId` - Get user history
- `DELETE /v1/classification/classify/:id` - Delete classification

## Troubleshooting

### Common Issues

1. **"AI server not running"**
   - Make sure Python server is started: `cd backend && python start_server.py`
   - Check if port 8000 is available

2. **"REST server not running"**
   - Make sure Node.js server is started: `cd backend/base_server && node start_rest_server.js`
   - Check if port 3000 is available

3. **"Authentication required"**
   - This is expected behavior - create an account or login
   - Check if MongoDB is running and accessible

4. **"Classification not saving"**
   - Ensure you're logged in
   - Check both servers are running
   - Verify MongoDB connection

### Port Conflicts

If you have port conflicts, you can modify the ports in:
- Frontend: `ai-waste-sort/vite.config.ts`
- REST API: `backend/base_server/.env.development`
- Python API: `backend/start_server.py`

Remember to update the API URLs in `ai-waste-sort/src/lib/api.ts` if you change ports.

## Features

### ✅ Implemented Features

- User authentication and authorization
- Protected routes (login required)
- AI-powered waste classification
- Classification history with database storage
- Real-time API status testing
- Responsive design
- Error handling and user feedback

### 🔄 Classification Process

1. User uploads image
2. AI model classifies waste type (plastic, glass, paper, metal, cardboard, trash)
3. User sees classification result with confidence score
4. User can save result to history
5. Points are awarded based on waste type
6. History shows all past classifications

## Development Notes

- The application uses JWT tokens for authentication
- All API calls include proper error handling
- The AI model is pre-trained and loaded on server startup
- Classification results are stored with user association
- The frontend includes comprehensive API testing tools

## Production Deployment

For production deployment:
1. Set up proper environment variables
2. Use a production MongoDB instance
3. Configure proper CORS settings
4. Set up SSL certificates
5. Use process managers (PM2 for Node.js, systemd for Python)
6. Set up reverse proxy (nginx)

## Support

If you encounter issues:
1. Check all three servers are running
2. Verify MongoDB connection
3. Use the API Test component to diagnose issues
4. Check browser console for frontend errors
5. Check server logs for backend errors