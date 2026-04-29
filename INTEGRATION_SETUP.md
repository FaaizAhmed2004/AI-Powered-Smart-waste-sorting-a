# AI Waste Sort - Complete Frontend-Backend Integration

## Architecture Overview

This project now integrates **two backend services**:

1. **AI Classification Service** (Python/FastAPI) - Port 8000
   - Direct ML model inference for waste classification
   - Lightweight and fast image processing

2. **REST API Service** (Node.js/Express) - Port 3000
   - Complete application backend with database
   - User authentication, history, community, gamification
   - Comprehensive data management

## Setup Instructions

### 1. AI Classification Service (Python)

```bash
cd backend
pip install -r requirements.txt
python start_server.py
```

**Available at:** `http://localhost:8000`

### 2. REST API Service (Node.js)

```bash
cd backend/base_server
npm install
node start_rest_server.js
```

**Available at:** `http://localhost:3000`

### 3. Frontend (React)

```bash
cd ai-waste-sort
npm install
npm run dev
```

**Available at:** `http://localhost:5173`

## API Integration Details

### AI Classification Service Endpoints

- **POST /scan** - Direct image classification
  - Input: Image file (multipart/form-data)
  - Output: `{ "label": "plastic", "confidence": 0.95 }`
- **GET /health** - Health check
- **GET /** - Service information

### REST API Service Endpoints

#### Authentication
- **POST /v1/register** - User registration
- **POST /v1/login** - User login
- **PUT /v1/logout** - User logout

#### Classification & History
- **POST /v1/classification/classify** - Classify and save to database
- **GET /v1/classification/classify/history/:userId** - Get user's scan history
- **DELETE /v1/classification/classify/:id** - Delete scan record

#### Community Features
- **GET /v1/community/posts** - Get community posts
- **POST /v1/community/posts** - Create new post
- **POST /v1/community/posts/:id/like** - Like a post
- **POST /v1/community/posts/:id/comments** - Add comment

#### Gamification
- **GET /v1/game/stats/:userId** - Get user statistics
- **GET /v1/game/leaderboard** - Get leaderboard
- **POST /v1/game/points** - Add points for activities
- **POST /v1/game/badges/:id/claim** - Claim badges

## Admin System

### Admin Authentication Endpoints
- **POST /v1/admin/register** - Register new admin
- **POST /v1/admin/login** - Admin login
- **POST /v1/admin/logout** - Admin logout

### Admin Dashboard Endpoints
- **GET /v1/admin/dashboard/stats** - Dashboard statistics
- **GET /v1/admin/users** - Get all users with pagination
- **GET /v1/admin/users/:userId** - Get user details
- **PATCH /v1/admin/users/:userId/status** - Update user status
- **DELETE /v1/admin/users/:userId** - Delete user
- **GET /v1/admin/classifications** - Get all classifications
- **DELETE /v1/admin/classifications/:id** - Delete classification

### Admin Features
- **Role-based Access**: Super Admin and Admin roles
- **Permission System**: Granular permissions for different operations
- **User Management**: View, activate/deactivate, delete users
- **Classification Management**: View and delete classifications
- **Dashboard Analytics**: User statistics and system overview

### Admin Access
- **Frontend Routes**:
  - `/admin/login` - Admin login page
  - `/admin/register` - Admin registration page  
  - `/admin/dashboard` - Admin dashboard
- **Access Link**: Available in main site header (Shield icon)

### Frontend Integration

#### Services Created

1. **Authentication Service** (`src/services/auth.ts`)
   - Login, register, logout functionality
   - Token management
   - User session handling

2. **Classification Service** (`src/services/classification.ts`)
   - Direct AI classification (fast, no storage)
   - Database classification (with history)
   - History management

3. **Community Service** (`src/services/community.ts`)
   - Post creation and management
   - Comments and likes
   - Social features

4. **Gamification Service** (`src/services/gamification.ts`)
   - Points and badges system
   - Leaderboards
   - User statistics

5. **Education Service** (`src/services/education.ts`)
   - Educational content
   - Quizzes and assessments
   - Learning progress

6. **Admin Service** (`src/services/admin.ts`)
   - Admin authentication (separate from user auth)
   - User management and analytics
   - Classification management
   - Dashboard statistics and insights

#### API Configuration

- **Dual API Setup**: Separate axios instances for AI and REST services
- **Authentication**: Automatic token injection for REST API calls
- **Error Handling**: Comprehensive error management with user feedback

### Updated Pages

1. **Scan Page**: 
   - Uses AI service for fast classification
   - Option to save results via REST API
   - Real-time API status monitoring

2. **History Page**:
   - Loads user's classification history from database
   - Authentication-protected
   - Delete functionality

3. **Login/Signup Pages**:
   - Full REST API integration
   - Token-based authentication
   - Proper error handling and feedback

## Database Schema

The REST API uses MongoDB with the following key collections:

- **Users**: User accounts and profiles
- **Classifications**: Scan history and results
- **Community**: Posts, comments, likes
- **Gamification**: User stats, badges, points
- **Education**: Content, quizzes, progress

## Environment Configuration

### Python Service (.env)
```
# No additional config needed - uses defaults
```

### Node.js Service (.env.development)
```
ENV=development
PORT=3000
SERVER_URL=http://localhost:3000
DATABASE_URL="mongodb+srv://..."
ACCESS_TOKEN_SECRET="your-secret"
REFRESH_TOKEN_SECRET="your-refresh-secret"
SALT_ROUNDS="10"
```

### Frontend (.env)
```
VITE_AI_API_URL=http://localhost:8000
VITE_REST_API_URL=http://localhost:3000/v1
```

## Testing the Integration

1. **Start all services** (AI, REST API, Frontend)
2. **Test API connections** using the built-in API test component
3. **Register/Login** to test authentication
4. **Scan images** to test AI classification
5. **Check history** to verify database integration
6. **Explore community features** for social functionality

## Development Workflow

1. **AI Model Updates**: Modify Python service, restart AI server
2. **Backend Features**: Update Node.js service, restart REST server
3. **Frontend Changes**: Hot reload automatically updates UI
4. **Database Changes**: Use migration scripts in base_server

## Production Deployment

- **AI Service**: Deploy Python FastAPI with gunicorn
- **REST API**: Deploy Node.js with PM2 or similar
- **Frontend**: Build and deploy static files
- **Database**: Use MongoDB Atlas or self-hosted MongoDB
- **Environment**: Update CORS settings and API URLs

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check that both servers allow frontend origin
2. **Authentication Failures**: Verify JWT tokens and secrets
3. **Database Connection**: Check MongoDB connection string
4. **Port Conflicts**: Ensure ports 3000, 8000, 5173 are available
5. **Model Loading**: Verify `waste_classifier.h5` and `waste_labels.txt` exist

### Debug Steps

1. Check API status using the frontend test component
2. Verify server logs for error messages
3. Test endpoints directly with curl or Postman
4. Check browser network tab for failed requests
5. Verify environment variables are loaded correctly

## Next Steps

- [ ] Add image upload to cloud storage
- [ ] Implement real-time notifications
- [ ] Add advanced analytics dashboard
- [ ] Create mobile app version
- [ ] Add more ML models for better accuracy
- [ ] Implement caching for better performance