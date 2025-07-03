import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Utility function to get client IP
function getClientIP(req) {
    const xVercelForwarded = req.headers['x-vercel-forwarded-for'];
    const xVercelProxied = req.headers['x-vercel-proxied-for'];
    const xForwardedFor = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    const xForwardedHost = req.headers['x-forwarded-host'];
    const via = req.headers['via'];
    const forwarded = req.headers['forwarded'];

    if (xVercelForwarded) {
        return xVercelForwarded.split(',')[0].trim();
    }
    if (xVercelProxied) {
        return xVercelProxied.split(',')[0].trim();
    }
    if (xForwardedFor) {
        return xForwardedFor.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';
}

// Function to determine proxy anonymity level
function detectProxyAnonymity(req) {
    const headers = req.headers;

    // Check for common proxy headers
    const hasVia = !!headers['via'];
    const hasForwarded = !!headers['forwarded'];
    const hasXFF = !!headers['x-forwarded-for'];
    const hasVercelXFF = !!headers['x-vercel-forwarded-for'];
    const hasVercelProxied = !!headers['x-vercel-proxied-for'];
    const hasRealIP = !!headers['x-real-ip'] || !!headers['cf-connecting-ip'];
    const hasProxyConnection = !!headers['proxy-connection'];
    const hasXForwardedHost = !!headers['x-forwarded-host'];
    const hasXForwardedProto = !!headers['x-forwarded-proto'];

    // Check for common proxy headers that indicate transparency
    const transparentHeaders = [
        'x-forwarded-for',
        'x-real-ip',
        'x-cluster-client-ip',
        'x-forwarded',
        'forwarded-for',
        'forwarded',
        'via',
        'client-ip',
        'x-coming-from',
        'x-originating-ip'
    ];

    const hasTransparentHeaders = transparentHeaders.some(header => !!headers[header]);

    // Elite proxy: No proxy headers detected
    if (!hasVia && !hasForwarded && !hasXFF && !hasProxyConnection && !hasTransparentHeaders) {
        return 'ELITE';
    }

    // Transparent proxy: Original IP can be detected
    if (hasXFF || hasRealIP || hasVercelXFF || hasVercelProxied || hasTransparentHeaders) {
        return 'TRANSPARENT';
    }

    // Anonymous proxy: Proxy detected but original IP hidden
    return 'ANONYMOUS';
}

// Function to get geolocation data
async function getGeolocation(ip) {
    // Check for local/private IPs
    if (
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.') ||
        ip.startsWith('fc00:') ||
        ip.startsWith('fe80:')
    ) {
        return {
            country: 'US',
            city: 'Local Development',
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`https://ipapi.co/${ip}/json/`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ProxyJudge/1.0)',
            },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.reason || 'Geolocation service error');
        }

        return {
            country: data.country_code || 'UNKNOWN',
            city: data.city || 'Unknown',
        };
    } catch (error) {
        console.error('Primary geolocation error:', error.message);

        // Fallback to ip-api.com
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
                `http://ip-api.com/json/${ip}?fields=status,countryCode,city`,
                {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; ProxyJudge/1.0)',
                    },
                }
            );
            clearTimeout(timeoutId);

            const data = await response.json();
            if (data.status === 'success') {
                return {
                    country: data.countryCode || 'UNKNOWN',
                    city: data.city || 'Unknown',
                };
            }
        } catch (fallbackError) {
            console.error('Fallback geolocation error:', fallbackError.message);
        }

        return {
            country: 'UNKNOWN',
            city: 'Unknown',
        };
    }
}

// Main judge endpoint
app.get('/judge', async (req, res) => {
    try {
        const requestTimeFloat = Date.now() / 1000;
        const requestTime = Math.floor(requestTimeFloat);

        const clientIP = getClientIP(req);
        const anonymity = detectProxyAnonymity(req);
        const location = await getGeolocation(clientIP);

        const responseData = {
            PROXY_COUNTRY: location.country,
            PROXY_CITY: location.city,
            PROXY_ANONYMITY: anonymity,
            ORIGINAL_CLIENT_IP: anonymity === 'TRANSPARENT' ? clientIP : null,
            REQUEST_TIME_FLOAT: requestTimeFloat,
            REQUEST_TIME: requestTime,
        };

        res.json(responseData);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        });
    }
});

// OPTIONS handler for CORS preflight
app.options('/judge', (req, res) => {
    res.status(200).end();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Proxy Judge API',
        version: '1.0.0',
        endpoints: {
            judge: '/judge',
            health: '/health'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Proxy Judge API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 