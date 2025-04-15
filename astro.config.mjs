import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless"; // or "@astrojs/vercel/edge"
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";

export default defineConfig({
  output: "server", // enables API routes
  adapter: vercel(),
  integrations: [tailwind(), mdx()],
});
