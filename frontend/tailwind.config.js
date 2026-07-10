/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            colors: {
                void: '#030308',
                ink: '#0a0d14',
                line: 'rgba(148, 163, 184, 0.12)',
                mint: '#22ffb2',
                azure: '#4d8dff',
                dim: '#8b93a7',
            },
            animation: {
                marquee: 'marquee 32s linear infinite',
                blink: 'blink 1.1s step-end infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
            },
        },
    },
    plugins: [],
}
