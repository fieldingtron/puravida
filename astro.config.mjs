import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server", // enables SSR & API support
  adapter: vercel(), // Vercel adapter for deployment
  integrations: [tailwind(), mdx()],
  build: {
    rollupOptions: {
      external: ["resend"],
    },
  },
});
