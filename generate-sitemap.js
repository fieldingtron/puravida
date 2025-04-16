import { writeFileSync, readdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { globby } from "globby";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Replace with your actual domain
const website = "https://www.puravidaexpediciones.com";

// Define trips based on image folder names
function getTrips() {
  // Look at the image folders to identify trip types
  const imgDir = join(__dirname, "public", "img");
  const tripPrefixes = new Set();

  try {
    const files = readdirSync(imgDir);

    // Look for trip image patterns like "apurimac1.webp", "futa2.webp", etc.
    files.forEach((file) => {
      if (
        file.endsWith(".webp") ||
        file.endsWith(".jpg") ||
        file.endsWith(".avif")
      ) {
        // Extract the trip name (text before the number)
        const match = file.match(/^([a-z]+)(?:\d+)/);
        if (match) {
          const tripName = match[1];
          // Only include recognized trip types
          if (
            [
              "apurimac",
              "colca",
              "cotahuasi",
              "futa",
              "tambopata",
              "urubamba",
            ].includes(tripName)
          ) {
            tripPrefixes.add(tripName);
          }
        }
      }
    });

    return Array.from(tripPrefixes);
  } catch (error) {
    console.error("Error reading image directory:", error);
    return [];
  }
}

async function generateSitemap() {
  console.log("Generating sitemap...");

  // Get all .astro files from the pages directory
  const pages = await globby([
    "src/pages/**/*.astro",
    "!src/pages/[slug].astro", // Exclude dynamic route templates
    "!src/pages/**/[slug].astro", // Exclude nested dynamic route templates
    "!src/pages/_*.astro", // Exclude special Astro pages
    "!src/pages/api", // Exclude API routes
  ]);

  // Get trip slugs
  const trips = getTrips();
  console.log(`Found trips: ${trips.join(", ")}`);

  // Format the sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map((page) => {
      // Convert file path to URL path
      const path =
        page
          .replace("src/pages", "")
          .replace(".astro", "")
          .replace("/index", "") || "/";

      // Normalize path
      const route = path === "/index" ? "/" : path;

      return `
  <url>
    <loc>${website}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === "/" ? "1.0" : "0.7"}</priority>
  </url>`;
    })
    .join("")}${
    // Add trip detail pages
    trips
      .map(
        (trip) => `
  <url>
    <loc>${website}/trips/${trip}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("")
  }
</urlset>`;

  // Write the sitemap file
  writeFileSync(join(__dirname, "public", "sitemap.xml"), sitemap);
  console.log("Sitemap generated successfully!");
}

generateSitemap().catch((e) => {
  console.error("Failed to generate sitemap:", e);
  process.exit(1);
});
