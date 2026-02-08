import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FBF8F1',   // Crema muy claro
          100: '#E4DDCB',  // Beige suave
          200: '#E8D0A4',  // Dorado claro
          300: '#DDB97A',  // Dorado medio
          400: '#CAA076',  // Caramelo dorado
          500: '#B88A5F',  // Tierra oscuro
          600: '#9D7355',  // Marrón cálido
          700: '#7C6C5F',  // Marrón grisáceo
          800: '#4A433C',  // Marrón oscuro
          900: '#2E2E24',  // Verde oscuro/negro
        },
        accent: {
          light: '#E8D0A4',
          DEFAULT: '#CAA076',
          dark: '#7C6C5F',
        },
        background: {
          light: '#FBF8F1',
          DEFAULT: '#E4DDCB',
        }
      },
    },
  },
  plugins: [],
}
export default config
