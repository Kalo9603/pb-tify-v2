module.exports = {
  content: [
    "./src/**/*.{js,html}",
  ],
  theme: {
    extend: {
      keyframes: {
        "toast-in": {
          "0%":   { opacity: "0", transform: "translateY(-12px) scale(.98)" },
          "60%":  { opacity: "1", transform: "translateY(6px) scale(1.02)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "toast-out": {
          "0%":   { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-12px) scale(.98)" }
        }
      },
      animation: {
        "toast-in":  "toast-in 400ms cubic-bezier(.2,.9,.2,1) forwards",
        "toast-out": "toast-out 320ms cubic-bezier(.4,0,.2,1) forwards"
      }
    }
  },
  safelist: [
    'animate-toast-in',
    'animate-toast-out',
  ],
  plugins: [],
}