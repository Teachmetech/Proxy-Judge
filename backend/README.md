# Proxy Judge Backend API

A Node.js Express API for analyzing proxy connections and detecting anonymity levels.

## Features

- 🔍 **Proxy Detection**: Identifies transparent, anonymous, and elite proxies
- 🌍 **Geolocation**: Determines country and city from IP address
- ⚡ **Fast Response**: Optimized for quick analysis
- 🛡️ **Security**: Built with security headers and CORS support
- 📊 **Monitoring**: Health check endpoint for monitoring

## API Endpoints

### `GET /judge`
Main endpoint for proxy analysis.

**Response:**
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

### `GET /health`
Health check endpoint.

### `GET /`
API information and available endpoints.

## Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm dev
```

3. Test the API:
```bash
curl http://localhost:8000/judge
```

## Railway Deployment

This backend is optimized for Railway deployment with custom domain support.

### Quick Deploy

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Configure Domain**: Set up `api.proxy-judge.com` as a custom domain
3. **Deploy**: Railway will automatically build and deploy

### Manual Deployment Steps

1. **Create Railway Project**:
   ```bash
   railway login
   railway new
   ```

2. **Deploy**:
   ```bash
   railway up
   ```

3. **Set Custom Domain**:
   - Go to Railway dashboard
   - Navigate to your project
   - Add custom domain: `api.proxy-judge.com`

### Environment Variables

No environment variables are required for basic functionality. Optional:

- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Railway sets this automatically

## Configuration Files

- **`railway.json`**: Railway deployment configuration
- **`nixpacks.toml`**: Build configuration for Railway's Nixpacks
- **`package.json`**: Dependencies and scripts

## Architecture

- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Morgan**: Request logging

## Anonymity Detection Logic

1. **Elite Proxy**: No proxy headers detected
2. **Anonymous Proxy**: Proxy headers present, but original IP hidden  
3. **Transparent Proxy**: Original IP address can be detected

## Performance

- Response time: < 100ms (excluding geolocation lookup)
- Geolocation timeout: 5 seconds with fallback
- Health check: < 10ms

## License

ISC 