import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18332d",
        moss: "#426b53",
        leaf: "#7c9d72",
        cream: "#f7f7f2",
        gold: "#d8ad5c",
      },
      boxShadow: { soft: "0 18px 50px rgba(34, 58, 47, .09)" },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
