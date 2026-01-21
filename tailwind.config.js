import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    resolve(__dirname, 'dev/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
