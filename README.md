# Astro Starter Kit: Basics

#TODO add open graph
SEO title and meta tags and descriptions

Here's a **basic SEO on-site checklist** you can use as a quick reference — perfect for making sure your site covers the essentials:

https://pagespeed.web.dev/analysis/https-puravidaexpediciones-com/6imzlsybeb?form_factor=mobile

## ✅ Basic On-Site SEO Checklist

### 🔤 **Content & Structure**

- [ ] Unique `<title>` tag for every page (50–60 characters)
- [ ] Clear and compelling `<meta description>` (150–160 characters)
- [ ] One `<h1>` tag per page, using target keywords
- [ ] Logical use of `<h2>`, `<h3>`, etc. for subheadings
- [ ] High-quality, original content (use keywords naturally)
- [ ] Internal links between relevant pages
- [ ] Outbound links to credible sources (optional but helpful)

---

### 🌍 **URLs & Navigation**

- [ ] SEO-friendly URLs (short, lowercase, hyphen-separated)
  - ✅ Example: `/yoga-retreats-costa-rica`
- [ ] Descriptive anchor text for links
- [ ] XML sitemap submitted to Google Search Console

---

### 🖼️ **Images**

- [ ] All images have descriptive `alt` text
- [ ] File sizes optimized for fast loading (under 200 KB if possible)
- [ ] Use modern formats like WebP for better performance

---

### 📱 **Mobile & Speed**

- [ ] Responsive design (works on all screen sizes)
- [ ] Pages load in under 2–3 seconds
- [ ] Minimal use of large scripts or animations
- [ ] Use a CDN (like Cloudflare) for faster delivery

---

### 🔒 **Technical Setup**

- [ ] SSL certificate enabled (site uses `https://`)
- [ ] Set canonical tags to avoid duplicate content
- [ ] No broken links or 404 pages
- [ ] Clean robots.txt file (no accidental blocking of content)
- [ ] Structured data/schema markup added (for rich snippets)

---

### 🧰 **Tools & Testing**

- [ ] Google Search Console connected
- [ ] Google Analytics or another tracking tool installed
- [ ] Test site with:
  - [Google PageSpeed Insights](https://pagespeed.web.dev/)
  - [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

## 🚀 Future Page Speed Enhancements

We've already implemented several page speed optimizations including:
- Preloading of critical images
- Optimized font loading
- Conditional AOS animations for mobile/desktop
- Resource hints (preconnect, dns-prefetch)
- Long-term caching headers for static assets
- Lazy loading for non-critical images

### Additional optimizations to consider:

#### Image Optimizations
- [ ] Implement responsive images with `srcset` and `sizes` attributes
- [ ] Convert remaining JPG/PNG images to WebP or AVIF formats
- [ ] Consider using Astro's built-in image optimization components
- [ ] Add width and height attributes to all images to prevent layout shifts

#### Performance Monitoring
- [ ] Set up Core Web Vitals monitoring in Google Search Console
- [ ] Implement Real User Monitoring (RUM) to track actual user experiences
- [ ] Create performance budgets for key metrics (LCP, FID, CLS)

#### Advanced Techniques
- [ ] Implement Intersection Observer API for more precise lazy loading
- [ ] Consider partial hydration for interactive components
- [ ] Explore edge caching solutions for dynamic content
- [ ] Implement critical CSS extraction for above-the-fold content

#### Server Optimizations
- [ ] Enable Brotli compression for text-based resources
- [ ] Implement HTTP/2 or HTTP/3 for multiplexed connections
- [ ] Consider edge functions for personalized content delivery
- [ ] Use stale-while-revalidate caching strategies for API responses

---
