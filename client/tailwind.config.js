/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: '#FDFBF7',
                'soft-pink': '#F7E1E6',
                'sage-green': '#D6E6D8',
                wood: '#8D6E63', // Slightly darker wood for text/borders? #D4A373 is good for bg.
                'wood-light': '#D4A373',
            },
            fontFamily: {
                sans: ['Quicksand', 'Nunito', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
