import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NetworkScene from './components/NetworkScene.jsx';
import { codeExamples, languageOptions } from './data/codeExamples.js';

gsap.registerPlugin(ScrollTrigger);

const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : 'https://api.proxy-judge.com';
const API_URL = `${API_BASE}/judge`;
const HEALTH_URL = `${API_BASE}/health`;

const RESPONSE_FIELDS = [
    {
        key: 'PROXY_ANONYMITY',
        type: 'string',
        desc: 'Judged anonymity level of your proxy: TRANSPARENT, ANONYMOUS, or ELITE.',
        sample: '"ELITE"',
    },
    {
        key: 'PROXY_DETECTED',
        type: 'boolean',
        desc: 'True when request headers or IP intelligence reveal proxy use.',
        sample: 'true',
    },
    {
        key: 'PROXY_COUNTRY',
        type: 'string',
        desc: 'ISO 3166-1 country code where your exit node appears to live.',
        sample: '"US"',
    },
    {
        key: 'PROXY_CITY',
        type: 'string',
        desc: 'Resolved city of the exit IP, straight from geolocation data.',
        sample: '"New York"',
    },
    {
        key: 'REQUEST_TIME',
        type: 'integer',
        desc: 'Unix timestamp of the moment your request hit the judge.',
        sample: '1767932460',
    },
    {
        key: 'REQUEST_TIME_FLOAT',
        type: 'float',
        desc: 'Same timestamp with microsecond precision, for latency math.',
        sample: '1767932460.1342',
    },
    {
        key: 'JUDGE_PROCESSING_MS',
        type: 'float',
        desc: 'Server-side lookup and processing time, separated from the client round trip.',
        sample: '42.15',
    },
];

const MARQUEE_ITEMS = [
    'ANONYMITY DETECTION',
    'GEO LOOKUP',
    'ZERO AUTH',
    'JSON RESPONSE',
    'SUB-MS TIMESTAMPS',
    'FREE FOREVER',
    'HEADER ANALYSIS',
    'NO RATE LIMITS',
];

function SectionHeading({ index, title, children }) {
    return (
        <div data-reveal className="mb-12 md:mb-16">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-mint">
                {index} /
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">
                {title}
            </h2>
            {children && <p className="mt-4 max-w-xl text-base text-dim md:text-lg">{children}</p>}
        </div>
    );
}

function CopyButton({ text, label = 'copy' }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard unavailable */
        }
    };
    return (
        <button
            onClick={copy}
            className={`rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors duration-200 ${copied
                ? 'border-mint/60 text-mint'
                : 'border-line text-dim hover:border-mint/40 hover:text-slate-200'
                }`}
        >
            {copied ? 'copied ✓' : label}
        </button>
    );
}

function StatusDot({ status }) {
    const color =
        status === 'live' ? 'bg-mint' : status === 'down' ? 'bg-rose-400' : 'bg-dim';
    return (
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            {status === 'live' && (
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`} />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color} ${status === 'checking' ? 'animate-pulse' : ''}`} />
        </span>
    );
}

function ApiStatusBadge({ status }) {
    const label = status === 'live' ? 'API live' : status === 'down' ? 'API down' : 'Checking';
    const styles =
        status === 'live'
            ? 'border-mint/40 text-mint'
            : status === 'down'
                ? 'border-rose-400/40 text-rose-300'
                : 'border-line text-dim';

    return (
        <span
            className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest sm:inline-flex ${styles}`}
            title={status === 'live' ? 'Health check passed' : status === 'down' ? 'Could not reach /health' : 'Pinging /health'}
            aria-live="polite"
        >
            <StatusDot status={status} />
            {label}
        </span>
    );
}

export default function App() {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [latency, setLatency] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('curl');
    const [apiStatus, setApiStatus] = useState('checking'); // checking | live | down
    const rootRef = useRef(null);
    const demoRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        const checkHealth = async () => {
            try {
                const res = await fetch(HEALTH_URL, { signal: controller.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setApiStatus(data.status === 'OK' ? 'live' : 'down');
            } catch (err) {
                if (err.name === 'AbortError') return;
                setApiStatus('down');
            }
        };
        checkHealth();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero entrance
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.from('[data-hero-line]', {
                yPercent: 110,
                duration: 1.1,
                stagger: 0.12,
                delay: 0.2,
            })
                .from('[data-hero-sub]', { y: 24, opacity: 0, duration: 0.8 }, '-=0.5')
                .from('[data-hero-cta]', { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.4')
                .from('[data-hero-badge]', { y: -12, opacity: 0, duration: 0.6 }, '-=0.8')
                .from('[data-hero-scroll]', { opacity: 0, duration: 0.8 }, '-=0.2');

            // Scroll reveals for every [data-reveal] block
            gsap.utils.toArray('[data-reveal]').forEach((el) => {
                gsap.from(el, {
                    y: 48,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 85%' },
                });
            });

            // Staggered field cards
            gsap.from('[data-field-card]', {
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: { trigger: '[data-fields]', start: 'top 80%' },
            });

            // Hero globe slowly recedes as you scroll
            gsap.to('[data-scene]', {
                opacity: 0.25,
                scale: 1.15,
                ease: 'none',
                scrollTrigger: {
                    trigger: '[data-hero]',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }, rootRef);

        return () => ctx.revert();
    }, []);

    const testEndpoint = async () => {
        setLoading(true);
        setResponse(null);
        const start = performance.now();
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            const roundTripMs = Math.round((performance.now() - start) * 100) / 100;
            const judgeMs = Number(data.JUDGE_PROCESSING_MS) || 0;
            setLatency({
                roundTripMs,
                judgeMs,
                networkMs: Math.max(0, Math.round((roundTripMs - judgeMs) * 100) / 100),
            });
            setResponse(data);
            setApiStatus('live');
        } catch {
            setLatency({
                roundTripMs: Math.round((performance.now() - start) * 100) / 100,
                judgeMs: null,
                networkMs: null,
            });
            setResponse({ error: 'Could not reach the judge. Try again or curl it directly.' });
            setApiStatus('down');
        }
        setLoading(false);
        requestAnimationFrame(() => {
            gsap.from('[data-response]', { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
        });
    };

    const scrollToDemo = () => demoRef.current?.scrollIntoView({ behavior: 'smooth' });
    const selectedExample = codeExamples[selectedLanguage];

    return (
        <div ref={rootRef} className="grain relative min-h-screen bg-void">
            {/* ================= NAV ================= */}
            <header
                data-hero-badge
                className="fixed inset-x-0 top-0 z-40 border-b border-line bg-void/60 backdrop-blur-md"
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
                    <a href="#" className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-widest text-white">
                        <img
                            src="/proxy-judge-logo.svg"
                            alt=""
                            className="h-8 w-8 shrink-0 drop-shadow-[0_0_10px_rgba(34,255,178,0.3)]"
                        />
                        <StatusDot status={apiStatus} />
                        PROXY_JUDGE
                    </a>
                    <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-dim md:flex">
                        <a href="#demo" className="transition-colors hover:text-mint">Live test</a>
                        <a href="#response" className="transition-colors hover:text-mint">Response</a>
                        <a href="#code" className="transition-colors hover:text-mint">Integrate</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <ApiStatusBadge status={apiStatus} />
                        <button
                            onClick={scrollToDemo}
                            className="rounded-full border border-mint/40 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-mint transition-colors hover:bg-mint/10"
                        >
                            Test now
                        </button>
                    </div>
                </div>
            </header>

            {/* ================= HERO ================= */}
            <section data-hero className="relative flex min-h-screen flex-col justify-center overflow-hidden">
                <div data-scene className="absolute inset-0">
                    <NetworkScene />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/40 via-transparent to-void" />

                <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-28 md:px-8">
                    <p data-hero-sub className="mb-6 font-mono text-xs uppercase tracking-[0.4em] text-mint md:text-sm">
                        HTTP proxy testing API
                    </p>

                    <h1 className="font-display font-bold leading-[0.95] text-white">
                        <span className="block overflow-hidden">
                            <span data-hero-line className="block text-[15vw] md:text-[9rem]">JUDGE</span>
                        </span>
                        <span className="block overflow-hidden">
                            <span data-hero-line className="block text-[15vw] text-transparent md:text-[9rem]" style={{ WebkitTextStroke: '1.5px rgba(34,255,178,0.9)' }}>
                                YOUR
                            </span>
                        </span>
                        <span className="block overflow-hidden">
                            <span data-hero-line className="glow-text block text-[15vw] md:text-[9rem]">PROXIES</span>
                        </span>
                    </h1>

                    <p data-hero-sub className="mt-8 max-w-xl text-base leading-relaxed text-dim md:text-lg">
                        One GET request. Anonymity level, exit-node geolocation, and
                        microsecond timestamps — returned as clean JSON. No keys, no
                        signup, no limits.
                    </p>

                    {/* GSAP animates the wrappers so the buttons' own transforms stay free for hover effects */}
                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <div data-hero-cta>
                            <button onClick={scrollToDemo} className="btn-primary">
                                Run a live test
                            </button>
                        </div>
                        <div data-hero-cta>
                            <a href="#code" className="btn-ghost">
                                View integrations
                            </a>
                        </div>
                    </div>
                </div>

                <div data-hero-scroll className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
                        scroll
                        <span className="block h-8 w-px bg-gradient-to-b from-mint to-transparent" />
                    </div>
                </div>
            </section>

            {/* ================= MARQUEE ================= */}
            <div className="relative z-10 overflow-hidden border-y border-line bg-ink/60 py-4">
                <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-[0.3em] text-dim">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                        <span key={i} className="flex items-center gap-12">
                            {item} <span className="text-mint">✦</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ================= LIVE DEMO ================= */}
            <section id="demo" ref={demoRef} className="grid-bg relative z-10 px-5 py-24 md:px-8 md:py-36">
                <div className="mx-auto max-w-6xl">
                    <SectionHeading index="01" title="Put it on the stand.">
                        Point any HTTP client at the endpoint — through your proxy — and
                        the judge returns its verdict instantly.
                    </SectionHeading>

                    <div data-reveal className="panel overflow-hidden">
                        {/* Terminal chrome */}
                        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                                <span className="ml-3 hidden font-mono text-xs text-dim sm:block">proxy-judge — verdict</span>
                            </div>
                            <CopyButton text={API_URL} label="copy url" />
                        </div>

                        <div className="grid gap-0 md:grid-cols-2">
                            {/* Request side */}
                            <div className="min-w-0 border-b border-line p-6 md:border-b-0 md:border-r md:p-8">
                                <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-dim">Request</p>
                                <div className="font-mono text-sm leading-7">
                                    <p>
                                        <span className="text-azure">GET</span>{' '}
                                        <span className="break-all text-slate-200">{API_URL}</span>
                                    </p>
                                    <p className="text-dim">Accept: application/json</p>
                                    <p className="text-dim">
                                        <span className="text-mint">→</span> routed through your proxy
                                    </p>
                                </div>
                                <button onClick={testEndpoint} disabled={loading} className="btn-primary mt-8 w-full disabled:opacity-50 sm:w-auto">
                                    {loading ? 'Judging…' : 'Send request'}
                                </button>
                            </div>

                            {/* Response side */}
                            <div className="min-h-[260px] min-w-0 p-6 md:p-8">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="font-mono text-[11px] uppercase tracking-widest text-dim">Verdict</p>
                                    {latency !== null && response && (
                                        <span className="text-right font-mono text-[11px] text-mint">
                                            {latency.roundTripMs} ms round trip
                                            {latency.networkMs !== null && (
                                                <span className="block text-dim">
                                                    ~{latency.networkMs} ms network + proxy · {latency.judgeMs} ms judge
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </div>
                                {response ? (
                                    <pre data-response className="overflow-x-auto font-mono text-sm leading-7 text-mint">
                                        {JSON.stringify(response, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="font-mono text-sm leading-7 text-dim">
                                        <p>// awaiting your request</p>
                                        <p>
                                            $ <span className="animate-blink text-mint">▊</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= RESPONSE FORMAT ================= */}
            <section id="response" className="relative z-10 px-5 py-24 md:px-8 md:py-36">
                <div className="mx-auto max-w-6xl">
                    <SectionHeading index="02" title="Useful fields. Zero noise.">
                        Everything you need to score a proxy, nothing you don't.
                    </SectionHeading>

                    <div data-fields className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {RESPONSE_FIELDS.map((f) => (
                            <div
                                key={f.key}
                                data-field-card
                                className="panel group p-6 transition-colors duration-300 hover:border-mint/30"
                            >
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <code className="break-all font-mono text-sm font-semibold text-mint">{f.key}</code>
                                    <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] uppercase text-dim">
                                        {f.type}
                                    </span>
                                </div>
                                <p className="mb-4 text-sm leading-relaxed text-dim">{f.desc}</p>
                                <p className="font-mono text-xs text-azure">{f.sample}</p>
                            </div>
                        ))}

                        <div data-field-card className="panel flex flex-col justify-between border-mint/20 bg-mint/[0.04] p-6">
                            <div>
                                <p className="mb-2 font-mono text-sm font-semibold text-white">Anonymity levels</p>
                                <ul className="space-y-2 font-mono text-xs leading-relaxed">
                                    <li><span className="text-red-400">TRANSPARENT</span><span className="text-dim"> — your real IP leaks</span></li>
                                    <li><span className="text-amber-300">ANONYMOUS</span><span className="text-dim"> — proxy use detectable</span></li>
                                    <li><span className="text-mint">ELITE</span><span className="text-dim"> — indistinguishable from direct</span></li>
                                </ul>
                            </div>
                            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-dim">the verdict scale</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CODE ================= */}
            <section id="code" className="grid-bg relative z-10 px-5 py-24 md:px-8 md:py-36">
                <div className="mx-auto max-w-6xl">
                    <SectionHeading index="03" title="Ship it in your stack.">
                        Copy-paste clients for every runtime you care about — proxy
                        config included.
                    </SectionHeading>

                    <div data-reveal>
                        <div className="mb-5 flex flex-wrap gap-2">
                            {languageOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSelectedLanguage(opt.value)}
                                    className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors duration-200 ${selectedLanguage === opt.value
                                        ? 'bg-mint text-void'
                                        : 'border border-line text-dim hover:border-mint/40 hover:text-slate-200'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="panel overflow-hidden">
                            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                                <span className="font-mono text-xs text-dim">
                                    {selectedExample.title.toLowerCase()}.example
                                </span>
                                <CopyButton text={selectedExample.code} />
                            </div>
                            <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-7 text-slate-300 md:p-8">
                                <code>{selectedExample.code}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FINAL CTA ================= */}
            <section className="relative z-10 overflow-hidden px-5 py-24 md:px-8 md:py-36">
                <div className="mx-auto max-w-6xl text-center">
                    <p data-reveal className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-mint">
                        court is in session
                    </p>
                    <h2 data-reveal className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight text-white md:text-7xl">
                        Every proxy deserves a fair trial.
                    </h2>
                    <div data-reveal className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <button onClick={scrollToDemo} className="btn-primary">Start judging</button>
                        <CopyButton text={`curl ${API_URL}`} label="copy curl command" />
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="relative z-10 border-t border-line px-5 py-8 md:px-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-xs text-dim sm:flex-row">
                    <span>PROXY_JUDGE © {new Date().getFullYear()}</span>
                    <span className="break-all">{API_URL}</span>
                    <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-mint" /> all systems judging
                    </span>
                </div>
            </footer>
        </div>
    );
}
