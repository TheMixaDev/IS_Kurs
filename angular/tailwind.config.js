/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'
import animations from 'tailwindcss-animated'

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      }
    },
    colors: {
      ...colors,
      primary: colors.blue,
      secondary: colors.indigo,
      warning: colors.yellow,
      danger: colors.red
    }
  },
  plugins: [
    require('flowbite/plugin'),
    animations
  ]
}

