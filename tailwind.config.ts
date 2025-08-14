/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "400px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          "50": "#F8F7E6",
          "100": "#EBE5B0",
          "200": "#E1D88A",
          "300": "#D3C654",
          "400": "#CABB33",
          "500": "#BDAA00",
          "600": "#AC9B00",
          "700": "#867900",
          "800": "#685E00",
          "900": "#4F4700",
          DEFAULT: "var(--primary)",
          foreground: "hsl(var(--primary-foreground))",
        },
        error: "#FF0000",
        success: "#00FF00",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        awesome: {
          DEFAULT: "hsl(var(--awesome))",
          foreground: "hsl(var(--awesome-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neutral: {
          progress: "#B4B4B4",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontSize: {
        captionBold: [
          "11px",
          {
            lineHeight: "140%",
            letterSpacing: "0.22px",
            fontWeight: "700",
          },
        ],
        caption: [
          "11px",
          {
            lineHeight: "140%",
            letterSpacing: "0.22px",
            fontWeight: "400",
          },
        ],
        bodyBold: [
          "13px",
          {
            lineHeight: "140%",
            letterSpacing: "0.26px",
            fontWeight: "700",
          },
        ],
        body: [
          "13px",
          {
            lineHeight: "140%",
            letterSpacing: "0.26px",
            fontWeight: "400",
          },
        ],
        title2Bold: [
          "16px",
          {
            lineHeight: "140%",
            letterSpacing: "0.32px",
            fontWeight: "700",
          },
        ],
        title2: [
          "16px",
          {
            lineHeight: "140%",
            letterSpacing: "0.32px",
            fontWeight: "400",
          },
        ],
        title1Bold: [
          "19px",
          {
            lineHeight: "140%",
            letterSpacing: "0.38px",
            fontWeight: "700",
          },
        ],
        title1: [
          "19px",
          {
            lineHeight: "140%",
            letterSpacing: "0.38px",
            fontWeight: "400",
          },
        ],
        h5: [
          "23px",
          {
            lineHeight: "140%",
            letterSpacing: "0.46px",
            fontWeight: "400",
          },
        ],
        h5Bold: [
          "23px",
          {
            lineHeight: "140%",
            letterSpacing: "0.46px",
            fontWeight: "700",
          },
        ],
        h4: [
          "28px",
          {
            lineHeight: "140%",
            letterSpacing: "0.56px",
            fontWeight: "400",
          },
        ],
        h4Bold: [
          "28px",
          {
            lineHeight: "140%",
            letterSpacing: "0.56px",
            fontWeight: "700",
          },
        ],
        h3: [
          "33px",
          {
            lineHeight: "140%",
            letterSpacing: "0.66px",
            fontWeight: "400",
          },
        ],
        h3Bold: [
          "33px",
          {
            lineHeight: "140%",
            letterSpacing: "0.66px",
            fontWeight: "700",
          },
        ],
        h2: [
          "40px",
          {
            lineHeight: "140%",
            letterSpacing: "0.8px",
            fontWeight: "400",
          },
        ],
        h2Bold: [
          "40px",
          {
            lineHeight: "140%",
            letterSpacing: "0.8px",
            fontWeight: "700",
          },
        ],
        h1: [
          "48px",
          {
            lineHeight: "140%",
            letterSpacing: "0.96px",
            fontWeight: "400",
          },
        ],
        h1Bold: [
          "48px",
          {
            lineHeight: "140%",
            letterSpacing: "0.96px",
            fontWeight: "700",
          },
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": {
            opacity: "1",
          },
          "20%,50%": {
            opacity: "0",
          },
        },
        "accordion-down": {
          from: {
            height: 0,
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: 0,
          },
        },
        meteor: {
          "0%": {
            transform: "rotate(215deg) translateX(0)",
            opacity: "1",
          },
          "70%": {
            opacity: "1",
          },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "meteor-effect": "meteor 5s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
