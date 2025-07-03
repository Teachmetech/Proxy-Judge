# Proxy Judge Monorepo

A comprehensive proxy detection and analysis service with separate frontend and backend deployments.

## 🏗️ Architecture

This monorepo contains two main applications:

- **Frontend** (`/frontend`) - React + Vite application for proxy-judge.com
- **Backend** (`/backend`) - Node.js Express API for api.proxy-judge.com

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm (recommended) or npm

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd Proxy-Judge
pnpm install
```

2. **Start both frontend and backend:**
```bash
pnpm dev
```

3. **Or start individually:**
```bash
# Frontend only (runs on http://localhost:3000)
pnpm dev:frontend

# Backend only (runs on http://localhost:8000)
pnpm dev:backend
```

## 📁 Project Structure

```
Proxy-Judge/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # TailwindCSS styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/               # Node.js Express API
│   ├── server.js         # Main server file
│   ├── package.json
│   ├── railway.json      # Railway deployment config
│   └── nixpacks.toml     # Build configuration
├── package.json          # Root workspace configuration
└── README.md
```

## 🌐 Deployment

### Frontend (Vercel) - proxy-judge.com

The frontend is optimized for Vercel deployment:

1. **Connect to Vercel:**
   - Import repository to Vercel
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/dist`
   - Set install command: `npm run install:all`

2. **Custom Domain:**
   - Add `proxy-judge.com` as custom domain in Vercel dashboard

### Backend (Railway) - api.proxy-judge.com

The backend is optimized for Railway deployment:

1. **Deploy to Railway:**
   ```bash
   cd backend
   railway login
   railway new
   railway up
   ```

2. **Custom Domain:**
   - Add `api.proxy-judge.com` in Railway dashboard
   - Railway will handle SSL automatically

3. **Alternative: One-Click Deploy**
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/nodejs)

## 🔧 Available Scripts

### Root Level
- `pnpm dev` - Start both frontend and backend
- `pnpm dev:frontend` - Start frontend only
- `pnpm dev:backend` - Start backend only
- `pnpm build` - Build frontend for production
- `pnpm install:all` - Install all dependencies
- `pnpm clean` - Clean node_modules and build artifacts

### Frontend (`/frontend`)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Backend (`/backend`)
- `pnpm start` - Start production server
- `pnpm dev` - Start development server with nodemon

## 🛠️ API Endpoints

### Main Endpoint
**GET** `https://api.proxy-judge.com/judge`

Response:
```json
{
  "PROXY_COUNTRY": "US",
  "PROXY_CITY": "New York",
  "PROXY_ANONYMITY": "TRANSPARENT",
  "ORIGINAL_CLIENT_IP": "192.168.1.1",
  "REQUEST_TIME_FLOAT": 1640995200.123,
  "REQUEST_TIME": 1640995200
}
```

### Health Check
**GET** `https://api.proxy-judge.com/health`

## 🧪 Testing

Test the API locally:
```bash
curl http://localhost:8000/judge
```

Test production API:
```bash
curl https://api.proxy-judge.com/judge
```

## 🔍 Features

- **🕵️ Proxy Detection**: Identifies transparent, anonymous, and elite proxies
- **🌍 Geolocation**: Determines country and city from IP address
- **⚡ Fast Response**: Optimized for quick analysis
- **🛡️ Security**: Built with security headers and CORS support
- **📱 Responsive**: Mobile-friendly frontend interface
- **🎨 Modern UI**: Beautiful gradient design with TailwindCSS
- **🔧 Code Examples**: Multiple programming language examples

## 🧬 Technology Stack

### Frontend
- React 19
- Vite
- TailwindCSS
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- CORS, Helmet, Morgan
- ES Modules

## 📦 Dependencies

The project uses pnpm workspaces for efficient dependency management. All dependencies are installed from the root level.

## 🐛 Troubleshooting

### Frontend not connecting to backend
- Check if backend is running on port 8000
- Verify CORS configuration in backend
- Check API URL in frontend code

### Railway deployment issues
- Ensure `railway.json` and `nixpacks.toml` are present
- Check build logs in Railway dashboard
- Verify environment variables

### Vercel deployment issues
- Check build command and output directory
- Ensure dependencies are properly installed
- Review build logs in Vercel dashboard

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## 🔗 Links

- **Frontend**: https://proxy-judge.com
- **API**: https://api.proxy-judge.com
- **Health Check**: https://api.proxy-judge.com/health 