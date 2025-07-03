# Deployment Guide

This guide covers deploying the Proxy Judge application to production with custom domains.

## 🎯 Deployment Overview

- **Frontend**: React + Vite → Vercel → `proxy-judge.com`
- **Backend**: Node.js + Express → Railway → `api.proxy-judge.com`

## 🚀 Frontend Deployment (Vercel)

### Step 1: Prepare Repository
Ensure your code is pushed to GitHub/GitLab/Bitbucket.

### Step 2: Deploy to Vercel

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your Git provider

2. **Import Project**
   - Click "New Project"
   - Import your repository
   - Vercel will detect it as a monorepo

3. **Configure Build Settings**
   
   **Option A: Use Root Directory (Recommended)**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: cd frontend && pnpm build
   Output Directory: frontend/dist
   Install Command: pnpm install
   ```
   
   **Option B: Use Frontend Directory**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Step 3: Custom Domain

1. **Add Domain**
   - Go to Project Settings → Domains
   - Add `proxy-judge.com`
   - Add `www.proxy-judge.com` (optional)

2. **DNS Configuration**
   - Point your domain's A record to Vercel's IP
   - Or use CNAME: `cname.vercel-dns.com`
   - Vercel will handle SSL automatically

### Environment Variables (if needed)
```
VITE_API_URL=https://api.proxy-judge.com
```

## 🚄 Backend Deployment (Railway)

### Step 1: Prepare for Railway

1. **Create Railway Account**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Install Railway CLI** (optional)
   ```bash
   npm install -g @railway/cli
   railway login
   ```

### Step 2: Deploy Backend

**Option A: GitHub Integration (Recommended)**

1. **New Project from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select "backend" folder as root directory

2. **Configuration**
   Railway will automatically detect the Node.js app and use the configuration from:
   - `package.json` (start script)
   - `railway.json` (deployment settings)
   - `nixpacks.toml` (build configuration)

**Option B: CLI Deployment**

```bash
cd backend
railway new
railway up
```

### Step 3: Custom Domain

1. **Add Custom Domain**
   - Go to Project → Settings → Domains
   - Add `api.proxy-judge.com`
   - Railway will provide DNS instructions

2. **DNS Configuration**
   - Add CNAME record: `api.proxy-judge.com` → `your-app.railway.app`
   - Railway handles SSL automatically

### Environment Variables
Railway automatically sets `PORT`. No additional variables needed for basic functionality.

## 🔧 Production Configuration

### Frontend Production Build
The frontend automatically detects production and uses the production API URL:
```javascript
const apiUrl = import.meta.env.DEV 
  ? 'http://localhost:8000/judge' 
  : 'https://api.proxy-judge.com/judge';
```

### Backend Production Settings
- CORS enabled for all origins
- Security headers via Helmet
- Request logging via Morgan
- Health check endpoint at `/health`

## 🧪 Testing Deployment

### Test Backend API
```bash
curl https://api.proxy-judge.com/health
curl https://api.proxy-judge.com/judge
```

### Test Frontend
- Visit `https://proxy-judge.com`
- Click "Test Endpoint" button
- Verify API integration works

## 🐛 Troubleshooting

### Common Issues

**Frontend build fails:**
- Check Node.js version (needs 18+)
- Verify TailwindCSS configuration
- Check import paths

**Vercel "No Output Directory" error:**
- Ensure `vercel.json` is in root directory
- Verify Output Directory is set to `frontend/dist`
- Check Build Command: `cd frontend && pnpm build`
- Make sure Install Command is `pnpm install`
- Try deploying with Frontend directory as Root Directory

**Backend deployment fails:**
- Verify `package.json` scripts
- Check Railway logs for errors
- Ensure port is configured correctly

**CORS errors:**
- Verify backend CORS configuration
- Check frontend API URL
- Ensure domains match

**Custom domain not working:**
- Check DNS propagation (can take 24-48 hours)
- Verify DNS records are correct
- Check SSL certificate status

### Railway Specific

**Build fails:**
```bash
# Check build logs
railway logs

# Redeploy
railway up --detach
```

**Environment issues:**
```bash
# List environment variables
railway variables

# Set environment variable
railway variables set NODE_ENV=production
```

### Vercel Specific

**Build fails:**
- Check build logs in Vercel dashboard
- Verify monorepo configuration
- Check dependency installation

**Domain issues:**
- Verify DNS configuration
- Check domain verification status
- Ensure SSL certificate is active

## 🔄 CI/CD Setup (Optional)

### Auto-deploy on Git Push

Both platforms support automatic deployments:

**Vercel:**
- Automatically deploys on push to main branch
- Preview deployments for pull requests

**Railway:**
- Automatically deploys on push to main branch
- Can configure branch-specific deployments

### GitHub Actions (Advanced)
Create `.github/workflows/deploy.yml` for custom CI/CD:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    # Configure Vercel deployment
    
  deploy-backend:
    # Configure Railway deployment
```

## 📊 Monitoring

### Railway Monitoring
- Built-in metrics dashboard
- Real-time logs
- Resource usage monitoring

### Vercel Monitoring
- Analytics dashboard
- Performance metrics
- Error tracking

### External Monitoring (Recommended)
- **Uptime**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible

## 🔐 Security Considerations

### Production Checklist
- ✅ HTTPS enabled (automatic on both platforms)
- ✅ Security headers configured (Helmet.js)
- ✅ CORS properly configured
- ✅ No sensitive data in frontend
- ✅ Rate limiting (consider implementing)
- ✅ Input validation (implemented)

### Additional Security
Consider implementing:
- API rate limiting
- Request size limits
- IP-based restrictions (if needed)
- Monitoring and alerting

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check GitHub issues for common problems
4. Create a new issue with detailed error information 