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
  ],
  safelist: [
    "bg-primary-600",
    "hover:bg-primary-700",
    "hover:bg-primary-700",
    "focus:ring-primary-300",
    "dark:bg-primary-500",
    "dark:hover:bg-primary-600",
    "dark:focus:ring-primary-700",

    "bg-secondary-600",
    "hover:bg-secondary-700",
    "hover:bg-secondary-700",
    "focus:ring-secondary-300",
    "dark:bg-secondary-500",
    "dark:hover:bg-secondary-600",
    "dark:focus:ring-secondary-700",

    "bg-danger-600",
    "hover:bg-danger-700",
    "hover:bg-danger-700",
    "focus:ring-danger-300",
    "dark:bg-danger-500",
    "dark:hover:bg-danger-600",
    "dark:focus:ring-danger-700",

    "bg-warning-600",
    "hover:bg-warning-700",
    "hover:bg-warning-700",
    "focus:ring-warning-300",
    "dark:bg-warning-500",
    "dark:hover:bg-warning-600",
    "dark:focus:ring-warning-700",
  ]
}

