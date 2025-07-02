import { NextResponse } from 'next/server';

// Utility function to get client IP
function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    return request.ip || '127.0.0.1';
}

// Function to determine proxy anonymity level (based on original Django logic)
function detectProxyAnonymity(request, clientIP) {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const via = request.headers.get('via');
    const xProxyId = request.headers.get('x-proxy-id');

    // Check if there's a comma in X-Forwarded-For (multiple IPs)
    if (xForwardedFor && xForwardedFor.includes(',')) {
        // If "unknown" is in X-Forwarded-For, it's ANONYMOUS
        if (xForwardedFor.toLowerCase().includes('unknown')) {
            return 'ANONYMOUS';
        } else {
            // Split the client IP to get first three segments
            const ipSegments = clientIP.split('.');
            if (ipSegments.length >= 3) {
                const firstThreeSegments = ipSegments[0] + '.' + ipSegments[1] + '.' + ipSegments[2];

                // Split forwarded IPs and check if any match the first three segments
                const forwardedIps = xForwardedFor.split(',').map(ip => ip.trim());
                let isTransparent = false;

                for (const forwardedIp of forwardedIps) {
                    if (!forwardedIp.includes(firstThreeSegments)) {
                        isTransparent = true;
                        break;
                    }
                }

                if (isTransparent) {
                    return 'TRANSPARENT';
                } else {
                    // Check for VIA or X-Proxy-ID headers
                    if (via || xProxyId) {
                        return 'ANONYMOUS';
                    } else {
                        return 'ELITE';
                    }
                }
            } else {
                // If IP format is invalid, fall back to checking headers
                if (via || xProxyId) {
                    return 'ANONYMOUS';
                } else {
                    return 'ELITE';
                }
            }
        }
    } else {
        // No comma in X-Forwarded-For or no X-Forwarded-For header
        // Check for VIA or X-Proxy-ID headers
        if (via || xProxyId) {
            return 'ANONYMOUS';
        } else {
            return 'ELITE';
        }
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

export async function GET(request) {
    try {
        // Get request timestamps
        const requestTimeFloat = Date.now() / 1000;
        const requestTime = Math.floor(requestTimeFloat);

        // Get client IP
        const clientIP = getClientIP(request);

        // Detect proxy anonymity
        const anonymity = detectProxyAnonymity(request, clientIP);

        // Get geolocation
        const location = await getGeolocation(clientIP);

        // Prepare response
        const responseData = {
            PROXY_COUNTRY: location.country,
            PROXY_CITY: location.city,
            PROXY_ANONYMITY: anonymity,
            REQUEST_TIME_FLOAT: requestTimeFloat,
            REQUEST_TIME: requestTime
        };

        // Return JSON response with CORS headers
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
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
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

// Handle OPTIONS for CORS
export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
} 