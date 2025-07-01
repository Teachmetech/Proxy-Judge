# Proxy Judge

A simple web service to analyze proxy connections, providing information about proxy location, anonymity level, and performance metrics.

## Features

- **Proxy Location Detection**: Identifies the country and city of the proxy server
- **Anonymity Level Analysis**: Determines proxy anonymity level (TRANSPARENT, ANONYMOUS, ELITE)
- **Performance Metrics**: Provides request timing information
- **Simple API**: Easy-to-use JSON API endpoint
- **Beautiful UI**: Clean web interface for testing and documentation

## API Endpoint

### GET `/api/check`

Returns proxy analysis data in JSON format.

#### Response Format

```json
{
  "PROXY_COUNTRY": "ES",
  "PROXY_CITY": "Madrid",
  "PROXY_ANONYMITY": "ELITE",
  "REQUEST_TIME_FLOAT": 1751352740.387924,
  "REQUEST_TIME": 1751352740
}
```

#### Response Fields

- **PROXY_COUNTRY**: ISO country code (e.g., "ES", "US", "GB")
- **PROXY_CITY**: City name where the proxy is located
- **PROXY_ANONYMITY**: Anonymity level
  - `TRANSPARENT`: Proxy reveals original IP address
  - `ANONYMOUS`: Proxy hides original IP but reveals itself as a proxy
  - `ELITE`: Proxy hides original IP and doesn't reveal itself as a proxy
- **REQUEST_TIME_FLOAT**: Precise timestamp with decimals
- **REQUEST_TIME**: Integer timestamp

## Usage Examples

### cURL
```bash
curl https://your-domain.vercel.app/api/check
```

### JavaScript (Browser)
```javascript
fetch('/api/check')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Python
```python
import requests

response = requests.get('https://your-domain.vercel.app/api/check')
data = response.json()
print(data)
```

## Deployment

This project is designed to be deployed on Vercel:

1. Fork or clone this repository
2. Connect your GitHub repository to Vercel
3. Deploy with default settings
4. Your proxy judge will be available at `https://your-project.vercel.app`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd proxy-judge

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build

```bash
npm run build
```

## How It Works

### IP Detection
The service analyzes various HTTP headers to determine the client's IP address:
- `x-forwarded-for`
- `x-real-ip`
- `cf-connecting-ip` (Cloudflare)
- Connection remote address

### Anonymity Detection
Anonymity level is determined by analyzing HTTP headers:

1. **TRANSPARENT**: Original IP is visible in headers or transparent proxy headers are present
2. **ANONYMOUS**: Some proxy headers are present but original IP is hidden
3. **ELITE**: Minimal proxy headers, appears like a direct connection

### Geolocation
Location data is obtained using free geolocation APIs:
- Primary: ipapi.co
- Fallback: ip-api.com

## Rate Limits

The geolocation services have rate limits:
- ipapi.co: 1,000 requests/day (free tier)
- ip-api.com: 1,000 requests/hour (free tier)

For production use with high traffic, consider upgrading to paid plans or implementing caching.

## CORS Support

The API includes CORS headers to allow cross-origin requests from any domain.

## Error Handling

The API includes comprehensive error handling:
- Invalid methods return 405
- Server errors return 500 with error details
- Graceful fallbacks for geolocation failures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. 