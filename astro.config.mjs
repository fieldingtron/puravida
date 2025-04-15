import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import vercelStatic from "@astrojs/vercel/static";

// https://astro.build/config
export default defineConfig({
  output: "static", // enables SSR & API support
  adapter: vercelStatic(), // Vercel adapter for deployment
  integrations: [tailwind(), mdx()],
  build: {
    rollupOptions: {
      external: ["resend"],
    },
  },
});
