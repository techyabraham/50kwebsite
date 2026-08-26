export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "purple-deep": "#3D0066",
        "purple-mid": "#6B21A8",
        "purple-bright": "#9333EA",
        "orange-fire": "#EA580C",
        "orange-warm": "#FB923C",
        "orange-glow": "#FED7AA",
        "off-white": "#FDF4FF",
        "dark-text": "#1A0030",
        "light-text": "#F3E8FF",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        inter: ["Space Grotesk", "sans-serif"],
        accent: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(147, 51, 234, 0.3)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        ringPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.45" },
          "50%": { transform: "scale(1.25)", opacity: "0" },
        },
        dotPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.35)" },
        },
      },
      animation: {
        shimmer: "shimmer 8s ease-in-out infinite alternate",
        "ring-pulse": "ringPulse 1.8s ease-out infinite",
        "dot-pulse": "dotPulse 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
