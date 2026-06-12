// /tailwind.config.ts
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: "class" as const,
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
  safelist: [
    // タグの色クラスをセーフリストに追加
    { pattern: /bg-(blue|green|amber|red|purple|pink|indigo|cyan)-100/ },
    { pattern: /bg-(blue|green|amber|red|purple|pink|indigo|cyan)-500/ },
    // { pattern: /bg-(blue|green|amber|red|purple|pink|indigo|cyan)-900/ },
    { pattern: /text-(blue|green|amber|red|purple|pink|indigo|cyan)-700/ },
    // { pattern: /text-(blue|green|amber|red|purple|pink|indigo|cyan)-800/ },
    // { pattern: /text-(blue|green|amber|red|purple|pink|indigo|cyan)-300/ },
    // 直接クラス名も指定
    "bg-blue-100",
    "bg-green-100",
    "bg-amber-100",
    "bg-red-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-indigo-100",
    "bg-cyan-100",
    "text-blue-700",
    "text-green-700",
    "text-amber-700",
    "text-red-700",
    "text-purple-700",
    "text-pink-700",
    "text-indigo-700",
    "text-cyan-700",
  ],
} as Config;

export default config;
