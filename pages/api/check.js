// Utility function to get client IP
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    return req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
}

// Function to determine proxy anonymity level
function detectProxyAnonymity(req, clientIP) {
    const headers = req.headers;

    // Check for proxy-revealing headers
    const proxyHeaders = [
        'x-forwarded-for',
        'x-real-ip',
        'x-forwarded-proto',
        'x-forwarded-host',
        'via',
        'x-proxy-id',
        'x-proxy-user',
        'forwarded',
        'client-ip',
        'true-client-ip',
        'x-cluster-client-ip',
        'x-original-forwarded-for'
    ];

    const transparentHeaders = [
        'remote-addr',
        'http-client-ip',
        'http-x-forwarded-for',
        'http-x-forwarded',
        'http-x-cluster-client-ip',
        'http-forwarded-for',
        'http-forwarded'
    ];

    let proxyHeaderCount = 0;
    let transparentHeaderCount = 0;

    // Count proxy-related headers
    proxyHeaders.forEach(header => {
        if (headers[header]) {
            proxyHeaderCount++;
        }
    });

    transparentHeaders.forEach(header => {
        if (headers[header]) {
            transparentHeaderCount++;
        }
    });

    // Check if original IP is exposed in headers
    const hasOriginalIP = Object.values(headers).some(value => {
        if (typeof value === 'string') {
            return value.includes(clientIP);
        }
        return false;
    });

    // Determine anonymity level
    if (transparentHeaderCount > 0 || hasOriginalIP) {
        return 'TRANSPARENT';
    } else if (proxyHeaderCount > 2) {
        return 'ANONYMOUS';
    } else if (proxyHeaderCount <= 1) {
        return 'ELITE';
    } else {
        return 'ANONYMOUS';
    }
}

// Function to get geolocation data
async function getGeolocation(ip) {
    // Handle localhost and private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return {
            country: 'US',
            city: 'Local Development'
        };
    }

    try {
        // Use ipapi.co for geolocation (free tier allows 1000 requests/day)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`https://ipapi.co/${ip}/json/`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ProxyJudge/1.0)'
            }
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
            city: data.city || 'Unknown'
        };
    } catch (error) {
        console.error('Primary geolocation error:', error.message);

        // Fallback to ip-api.com
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,city`, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ProxyJudge/1.0)'
                }
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.status === 'success') {
                return {
                    country: data.countryCode || 'UNKNOWN',
                    city: data.city || 'Unknown'
                };
            }
        } catch (fallbackError) {
            console.error('Fallback geolocation error:', fallbackError.message);
        }

        // If all geolocation services fail, try to determine from headers
        // This is a basic heuristic and not very reliable
        return {
            country: 'UNKNOWN',
            city: 'Unknown'
        };
    }
}

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get request timestamps
        const requestTimeFloat = Date.now() / 1000;
        const requestTime = Math.floor(requestTimeFloat);

        // Get client IP
        const clientIP = getClientIP(req);

        // Detect proxy anonymity
        const anonymity = detectProxyAnonymity(req, clientIP);

        // Get geolocation
        const location = await getGeolocation(clientIP);

        // Prepare response
        const response = {
            PROXY_COUNTRY: location.country,
            PROXY_CITY: location.city,
            PROXY_ANONYMITY: anonymity,
            REQUEST_TIME_FLOAT: requestTimeFloat,
            REQUEST_TIME: requestTime
        };

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Return JSON response
        res.status(200).json(response);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
} 