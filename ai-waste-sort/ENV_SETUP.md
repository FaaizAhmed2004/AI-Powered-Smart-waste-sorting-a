# Frontend Environment Configuration Guide

## Overview
The frontend uses environment variables to connect to deployed backend services. This allows you to easily switch between development, staging, and production backends without code changes.

## Setup Instructions

### Development (Local)

1. The `.env` file is already configured for local development:
   ```
   VITE_AI_API_URL=http://localhost:8000
   VITE_REST_API_URL=http://localhost:3000/v1
   ```

2. Start your local backend services (Python AI service on 8000, Node REST API on 3000)

3. Run the frontend development server:
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Update with deployed backend URLs:**
   ```env
   VITE_AI_API_URL=https://your-ai-service-domain.com
   VITE_REST_API_URL=https://your-rest-api-domain.com/v1
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Deploy the `dist` folder** to your hosting provider (Vercel, Netlify, etc.)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AI_API_URL` | AI waste detection backend | `http://localhost:8000` or `https://api.example.com` |
| `VITE_REST_API_URL` | REST API for user/auth | `http://localhost:3000/v1` or `https://api.example.com/v1` |

## Important Notes

- **Prefix:** All frontend-accessible variables must start with `VITE_` (Vite requirement)
- **.env is NOT committed:** The `.env` file is in `.gitignore` to prevent committing local/sensitive config
- **Use `.env.example`:** Commit `.env.example` instead as a template for other developers
- **CORS:** Ensure your deployed backends have CORS headers configured to accept requests from your frontend domain

## Deployment Checklist

- [ ] Update `.env` with deployed backend URLs
- [ ] Run `npm run build` to create production build
- [ ] Verify `dist` folder is generated
- [ ] Deploy `dist` folder to hosting provider
- [ ] Test API connectivity from deployed frontend
- [ ] Monitor browser console for CORS or connection errors

## Troubleshooting

**Backend not reachable:**
- Check that `VITE_AI_API_URL` and `VITE_REST_API_URL` are correct
- Verify backend servers are running and accessible
- Check browser DevTools Network tab for failed requests

**CORS errors:**
- Backend must have CORS enabled for your frontend domain
- Add your frontend URL to backend CORS whitelist

**Environment variables not loading:**
- Rebuild frontend after `.env` changes: `npm run build`
- In development, restart dev server: `npm run dev`
