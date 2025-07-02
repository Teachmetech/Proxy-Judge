import { NextResponse } from 'next/server';

// Utility function to get client IP
function getClientIP(request) {
    const headers = request.headers;
    const xVercelForwarded = headers.get('x-vercel-forwarded-for');
    const xVercelProxied = headers.get('x-vercel-proxied-for');
    const xForwardedFor = headers.get('x-forwarded-for');
    const realIP = headers.get('x-real-ip');
    const cfConnectingIP = headers.get('cf-connecting-ip');

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

    return request.ip ?? '127.0.0.1';
}

// Function to determine proxy anonymity level
function detectProxyAnonymity(request) {
    const headers = request.headers;
    const hasVia = headers.has('via');
    const hasForwarded = headers.has('forwarded');
    const hasXFF = headers.has('x-forwarded-for');
    const hasVercelXFF = headers.has('x-vercel-forwarded-for');
    const hasVercelProxied = headers.has('x-vercel-proxied-for');
    const hasRealIP = headers.has('x-real-ip') || headers.has('cf-connecting-ip');

    // Any sign of a proxy
    const hasProxy = hasVia || hasForwarded || hasXFF || hasVercelXFF || hasVercelProxied;

    if (!hasProxy) {
        return 'ELITE';
    }

    // We can see the true client IP
    const canDetectClientIP = hasXFF || hasVercelXFF || hasRealIP || hasVercelProxied;
    if (canDetectClientIP) {
        return 'TRANSPARENT';
    }

    // Proxy present but client IP hidden
    return 'ANONYMOUS';
}

// Function to get geolocation data
async function getGeolocation(ip) {
    if (
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.')
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

export async function GET(request) {
    try {
        const requestTimeFloat = Date.now() / 1000;
        const requestTime = Math.floor(requestTimeFloat);

        const clientIP = getClientIP(request);
        const anonymity = detectProxyAnonymity(request);
        const location = await getGeolocation(clientIP);

        const responseData = {
            PROXY_COUNTRY: location.country,
            PROXY_CITY: location.city,
            PROXY_ANONYMITY: anonymity,
            ORIGINAL_CLIENT_IP: anonymity === 'TRANSPARENT' ? clientIP : null,
            REQUEST_TIME_FLOAT: requestTimeFloat,
            REQUEST_TIME: requestTime,
        };

        return NextResponse.json(responseData, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message:
                    process.env.NODE_ENV === 'development'
                        ? error.message
                        : 'Something went wrong',
            },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            }
        );
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}