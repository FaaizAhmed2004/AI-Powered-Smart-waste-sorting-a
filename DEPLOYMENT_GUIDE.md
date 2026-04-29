# Deployment Guide

## Overview

This guide covers deploying the **AI Waste Sort** application with:
- React frontend with environment-based API configuration
- Python AI service (YOLO waste detection)
- Node.js REST API for users, auth, and gamification
- MongoDB for data persistence
- Recycling center finder with Google Maps navigation

---

## Part 1: Frontend Deployment (Vercel/Netlify)

### Environment Setup

**File**: `ai-waste-sort/.env`

```env
# Production Backend URLs
VITE_AI_API_URL=https://your-ai-service.example.com
VITE_REST_API_URL=https://your-rest-api.example.com/v1
```

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Build and Deploy:**
   ```bash
   cd ai-waste-sort
   npm run build
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - `VITE_AI_API_URL`: Your deployed AI service URL
   - `VITE_REST_API_URL`: Your deployed REST API URL

### Deploy to Netlify

1. **Build the application:**
   ```bash
   cd ai-waste-sort
   npm run build
   ```

2. **Deploy using Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Or connect GitHub:**
   - Authorize Netlify on GitHub
   - Select repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify UI

---

## Part 2: Backend Deployment

### Python AI Service

#### Option 1: Railway (Recommended for quick setup)

```bash
cd backend
railway init
railway up
```

#### Option 2: Docker on any cloud

```bash
# Build
docker build -f Dockerfile.backend -t ai-waste-sort-python .

# Push to registry
docker tag ai-waste-sort-python:latest your-registry/ai-waste-sort-python
docker push your-registry/ai-waste-sort-python

# Deploy on Render/Railway/AWS
# Set PORT=8000 environment variable
```

#### Key Environment Variables:
- `PORT=8000` (default)

### Node.js REST API

#### Option 1: Railway

```bash
cd backend/base_server
railway init
railway up
```

#### Option 2: Render

1. Connect GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm run start`

#### Environment Variables (Required):
```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ai-waste-sort

# Authentication
JWT_SECRET=your-super-secret-key-generate-with-openssl-rand-hex-32

# Server
PORT=3000
NODE_ENV=production

# CORS
FRONTEND_URL=https://yourdomain.com
```

---

## Part 3: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas account:** https://www.mongodb.com/cloud/atlas
2. **Create cluster** (free tier available)
3. **Create database user** with password
4. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ai-waste-sort
   ```
5. **Whitelist IP addresses:** Add production server IPs
6. **Add to backend `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-waste-sort
   ```

---

## Part 4: CORS Configuration

### Update Backend CORS Settings

**File**: `backend/base_server/src/app.ts` (or middleware file)

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:5173',              // Development
    'https://yourdomain.com',              // Production
    'https://www.yourdomain.com',
    'https://app.yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Python AI Service CORS

**File**: `backend/main.py`

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Part 5: Recycling Center Navigation Feature

### How It Works

The location page helps users find and navigate to nearby recycling centers:

1. **Get User Location**: Click "My Location" button
2. **View Recycling Centers**: List shows nearby centers sorted by distance
3. **Navigate**: 
   - **Mobile (iOS)**: Opens Apple Maps with turn-by-turn navigation
   - **Mobile (Android)**: Opens Google Maps with navigation
   - **Desktop**: Opens Google Maps web with directions

### Required Services

- **MapTiler API**: For displaying maps (free tier available)
- **Recycling Centers Database**: Backend provides list via `/v1/location/centers` endpoint

### Configuration

No additional setup required for navigation. It uses:
- Browser geolocation API (requires user permission)
- Native mobile maps apps (if available)
- Google Maps web (fallback for desktop)

---

## Part 6: Complete Deployment Checklist

### Pre-Deployment

- [ ] Update `.env` with production URLs
- [ ] Update CORS settings in both backends
- [ ] Create MongoDB Atlas cluster
- [ ] Generate secure JWT secret (`openssl rand -hex 32`)
- [ ] Test locally: `npm run dev` + backend services running
- [ ] Build frontend: `npm run build` (check for errors)

### Deployment

- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy Python AI service to Railway/Render
- [ ] Deploy Node.js REST API to Railway/Render
- [ ] Set all environment variables on deployment platforms
- [ ] Verify MongoDB connection
- [ ] Test CORS from frontend

### Post-Deployment

- [ ] Frontend loads at custom domain
- [ ] Can register/login successfully
- [ ] Can scan and classify waste
- [ ] Dashboard displays charts with data
- [ ] Location page shows recycling centers
- [ ] "Navigate Here" button works correctly
- [ ] No 404 or CORS errors in browser console
- [ ] Performance is acceptable (check Lighthouse)

---

## Part 7: Monitoring & Troubleshooting

### API Health Checks

```bash
# AI Service
curl https://your-ai-service.example.com/health

# REST API
curl https://your-rest-api.example.com/v1/health
```

### Common Issues

**CORS Error in Browser Console**
- Update backend CORS configuration
- Add frontend domain to allowed origins
- Restart backend services
- Clear browser cache

**Backend not reachable**
- Verify `.env` has correct URLs
- Check backend services are running
- Check firewall rules allow traffic
- Verify DNS records

**Images not loading**
- Check S3/storage bucket permissions
- Verify upload endpoint working
- Check image URLs in response

**Database connection failed**
- Verify MongoDB Atlas whitelist includes server IP
- Check connection string is correct
- Verify credentials (username/password)

---

## Part 8: Performance Optimization

### Frontend

```bash
# Check bundle size
npm run build

# Analyze
npx vite-bundle-visualizer dist
```

### Backend

- Set up Redis for caching
- Index frequently queried database fields
- Use CDN for static files
- Set up load balancing for high traffic

---

## Environment Variables Reference

### Frontend (.env in `ai-waste-sort/`)

| Variable | Example | Notes |
|----------|---------|-------|
| `VITE_AI_API_URL` | `https://api.example.com` | AI service endpoint |
| `VITE_REST_API_URL` | `https://api.example.com/v1` | REST API endpoint |

### Backend (.env in `backend/base_server/`)

| Variable | Example | Notes |
|----------|---------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | Database connection |
| `JWT_SECRET` | `abc123...` | Generate with `openssl rand -hex 32` |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `production` | Environment |
| `FRONTEND_URL` | `https://yourdomain.com` | For CORS |