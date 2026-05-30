/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html'],
    theme: {
        extend: {
            colors: {
                forest: '#2D5016',
                bark:   '#7B3F1C',
                gold:   '#C9962C',
                cream:  '#FAF7F2',
                warm:   '#6B6458',
            },
            fontFamily: {
                serif: ['Playfair Display', 'Georgia', 'serif'],
                sans:  ['Inter', 'system-ui', 'sans-serif'],
            }
        }
    },
    plugins: [],
}
