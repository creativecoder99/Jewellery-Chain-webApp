/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#FBF9F5",
        surface: "#FFFFFF",
        "surface-subtle": "#F6F3EC",
        "surface-muted": "#EDE7DB",
        border: "#E2DCD0",
        "border-strong": "#C5BCAB",
        ink: {
          primary: "#1C1917",
          secondary: "#57534E",
          muted: "#78716C",
        },
        accent: {
          DEFAULT: "#8C6820",
          hover: "#755617",
          light: "#F7F1E1",
          border: "#D8C7A0",
        },
        status: {
          valid: "#1E5E3A",
          "valid-bg": "#EBF5EE",
          "valid-border": "#C3E2CD",
          review: "#8A5B0B",
          "review-bg": "#FDF5E6",
          "review-border": "#F0DAA8",
          loss: "#8E2424",
          "loss-bg": "#FAECEC",
          "loss-border": "#EBB9B9",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Segoe UI Mono",
          "Roboto Mono",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
}
