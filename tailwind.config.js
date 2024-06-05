/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,njk}"],
    darkMode: ['selector', '[data-mode="dark"]'],
    theme: {
        extend: {
            colors: {
                change: 'transparent',
            },
        },
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'), 
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'), 
    ],
}