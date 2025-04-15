const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const { URL } = require("url");

// URL of the website to scrape images from
const websiteUrl = "https://puravidaexpediciones.com";

// Directory to save the images
const outputDir = path.join(__dirname, "public", "img", "puravida");

// Store visited URLs to avoid duplicates
const visitedUrls = new Set();
// Store downloaded image URLs to avoid duplicates
const downloadedImages = new Set();

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to validate and normalize URL
function normalizeUrl(url, baseUrl) {
  try {
    // Handle relative URLs
    if (!url.startsWith("http")) {
      if (url.startsWith("/")) {
        // Absolute path relative to domain
        const urlObj = new URL(baseUrl);
        return `${urlObj.protocol}//${urlObj.host}${url}`;
      } else {
        // Relative path
        return new URL(url, baseUrl).href;
      }
    }
    return url;
  } catch (error) {
    console.error(`Error normalizing URL ${url}:`, error.message);
    return null;
  }
}

// Function to download an image
async function downloadImage(url, filenameHint = null) {
  try {
    // Skip if already downloaded
    if (downloadedImages.has(url)) {
      console.log(`Skipping already downloaded image: ${url}`);
      return;
    }

    // Generate a unique filename
    let filename;
    if (filenameHint) {
      filename = filenameHint;
    } else {
      try {
        const urlObj = new URL(url);
        filename = path.basename(urlObj.pathname);

        // Handle URLs without a filename
        if (!filename || filename === "" || !filename.includes(".")) {
          filename = `img_${Date.now()}_${Math.floor(
            Math.random() * 1000
          )}.jpg`;
        }
      } catch (error) {
        filename = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
      }
    }

    const filePath = path.join(outputDir, filename);

    console.log(`Downloading ${url} to ${filename}...`);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 30000, // 30 second timeout
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      },
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        downloadedImages.add(url);
        resolve(filename);
      });
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error.message);
  }
}

// Function to extract image URLs from a page
function extractImageUrls($, baseUrl) {
  const imageUrls = new Set();

  // Regular image tags
  $("img").each((_, img) => {
    const src = $(img).attr("src");
    if (src) {
      const absoluteUrl = normalizeUrl(src, baseUrl);
      if (absoluteUrl) imageUrls.add(absoluteUrl);
    }
  });

  // Background images in style attributes
  $('[style*="background"]').each((_, el) => {
    const style = $(el).attr("style");
    if (style) {
      const match = style.match(
        /background(-image)?:\s*url\(['"]?([^'")]+)['"]?\)/i
      );
      if (match && match[2]) {
        const absoluteUrl = normalizeUrl(match[2], baseUrl);
        if (absoluteUrl) imageUrls.add(absoluteUrl);
      }
    }
  });

  // Common slider elements
  // Wix sliders
  $(".wix-image-slider img, .wix-slider img, .image-gallery img").each(
    (_, img) => {
      const src = $(img).attr("src") || $(img).attr("data-src");
      if (src) {
        const absoluteUrl = normalizeUrl(src, baseUrl);
        if (absoluteUrl) imageUrls.add(absoluteUrl);
      }
    }
  );

  // Data attributes often used for lazy loading in sliders
  $("[data-src], [data-lazy], [data-lazy-src], [data-original]").each(
    (_, el) => {
      const src =
        $(el).attr("data-src") ||
        $(el).attr("data-lazy") ||
        $(el).attr("data-lazy-src") ||
        $(el).attr("data-original");
      if (src) {
        const absoluteUrl = normalizeUrl(src, baseUrl);
        if (absoluteUrl) imageUrls.add(absoluteUrl);
      }
    }
  );

  return [...imageUrls];
}

// Function to extract links from a page
function extractLinks($, baseUrl) {
  const links = new Set();

  $("a").each((_, a) => {
    const href = $(a).attr("href");
    if (href) {
      try {
        const absoluteUrl = normalizeUrl(href, baseUrl);
        if (absoluteUrl && absoluteUrl.startsWith(websiteUrl)) {
          // Filter out non-HTML resources and anchors
          if (
            !absoluteUrl.match(
              /\.(jpg|jpeg|png|gif|pdf|zip|doc|docx|xls|xlsx|mp3|mp4|avi|mov)$/i
            ) &&
            !absoluteUrl.includes("#")
          ) {
            links.add(absoluteUrl);
          }
        }
      } catch (error) {
        console.error(`Error processing link ${href}:`, error.message);
      }
    }
  });

  return [...links];
}

// Function to crawl a page and extract images and links
async function crawlPage(url) {
  if (visitedUrls.has(url)) {
    return [];
  }

  visitedUrls.add(url);
  console.log(`Crawling: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      },
      timeout: 30000, // 30 second timeout
    });

    const $ = cheerio.load(response.data);

    // Extract images
    const imageUrls = extractImageUrls($, url);
    console.log(`Found ${imageUrls.length} images on ${url}`);

    // Download images
    const imagePromises = imageUrls.map((imgUrl) => downloadImage(imgUrl));
    await Promise.all(imagePromises);

    // Find links to other pages
    const links = extractLinks($, url);
    console.log(`Found ${links.length} links on ${url}`);

    return links;
  } catch (error) {
    console.error(`Error crawling ${url}:`, error.message);
    return [];
  }
}

// Main function to start crawling
async function startCrawling() {
  console.log(`Starting crawl of ${websiteUrl}`);
  console.log(`Saving images to ${outputDir}`);

  // Start with the homepage
  let pagesToVisit = [websiteUrl];

  // Breadth-first crawl
  while (pagesToVisit.length > 0) {
    const currentUrl = pagesToVisit.shift();

    const newLinks = await crawlPage(currentUrl);

    // Add new links to the queue if they haven't been visited yet
    for (const link of newLinks) {
      if (!visitedUrls.has(link) && !pagesToVisit.includes(link)) {
        pagesToVisit.push(link);
      }
    }

    console.log(
      `Pages visited: ${visitedUrls.size}, Pages to visit: ${pagesToVisit.length}`
    );
  }

  console.log("Crawling complete!");
  console.log(
    `Downloaded ${downloadedImages.size} unique images to ${outputDir}`
  );
}

startCrawling().catch((error) => {
  console.error("Error in crawler:", error);
});
