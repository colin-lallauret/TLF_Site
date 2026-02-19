import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: {
                    DEFAULT: '#FDFBF0',
                    dark: '#F5F0DC',
                },
                green: {
                    DEFAULT: '#00703C',
                    dark: '#005A30',
                    light: '#E8F5EE',
                },
                terracotta: {
                    DEFAULT: '#E36B39',
                    light: '#FAEEE6',
                    dark: '#C8562B',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['"Playfair Display"', 'Georgia', 'serif'],
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
                '4xl': '32px',
            },
            boxShadow: {
                card: '0 2px 16px rgba(0, 0, 0, 0.08)',
                'card-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
        },
    },
    plugins: [],
};

export default config;
