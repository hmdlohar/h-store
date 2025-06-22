const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../.env.local')
});
const fs = require('fs');
const axios = require('axios');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:2008';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2009'; // Replace with your actual domain
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Priority and change frequency settings
const PRIORITIES = {
  home: 1.0,
  products: 0.9,
  productDetail: 0.8,
  staticPages: 0.7,
  orderPages: 0.6,
  authPages: 0.5,
};

const CHANGE_FREQ = {
  home: 'daily',
  products: 'weekly',
  productDetail: 'weekly',
  staticPages: 'monthly',
  orderPages: 'never',
  authPages: 'monthly',
};

// Static pages for e-commerce
const STATIC_PAGES = [
  { path: '/', priority: PRIORITIES.home, changefreq: CHANGE_FREQ.home },
  { path: '/products', priority: PRIORITIES.products, changefreq: CHANGE_FREQ.products },
  { path: '/contact', priority: PRIORITIES.staticPages, changefreq: CHANGE_FREQ.staticPages },
  { path: '/privacy-policy', priority: PRIORITIES.staticPages, changefreq: CHANGE_FREQ.staticPages },
  { path: '/terms-of-service', priority: PRIORITIES.staticPages, changefreq: CHANGE_FREQ.staticPages },
  { path: '/return-policy', priority: PRIORITIES.staticPages, changefreq: CHANGE_FREQ.staticPages },
  { path: '/login', priority: PRIORITIES.authPages, changefreq: CHANGE_FREQ.authPages },
  { path: '/profile', priority: PRIORITIES.authPages, changefreq: CHANGE_FREQ.authPages },
  { path: '/orders', priority: PRIORITIES.orderPages, changefreq: CHANGE_FREQ.orderPages },
];

// Fetch all products from the API
async function fetchProducts() {
  try {
    console.log('Fetching products from API...');
    const response = await axios.get(`${BASE_URL}/api/products`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
}

// Generate XML sitemap
function generateSitemapXML(urls) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urlEntries = urls.map(url => {
    const lastmod = url.lastmod || new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  }).join('\n');

  return `${xmlHeader}
${urlsetOpen}
${urlEntries}
${urlsetClose}`;
}

// Generate sitemap URLs
async function generateSitemapUrls() {
  const urls = [];

  // Add static pages
  STATIC_PAGES.forEach(page => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  // Add product pages
  const products = await fetchProducts();
  console.log(`Found ${products.length} products`);
  
  products.forEach(product => {
    if (product.slug && product.isActive !== false) {
      urls.push({
        loc: `${SITE_URL}/p/${product.slug}`,
        lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: CHANGE_FREQ.productDetail,
        priority: PRIORITIES.productDetail,
      });
    }
  });

  return urls;
}

// Main function
async function generateSitemap() {
  try {
    console.log('Starting sitemap generation...');
    console.log(`Base URL: ${SITE_URL}`);
    console.log(`API URL: ${BASE_URL}`);

    // Ensure public directory exists
    const publicDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate URLs
    const urls = await generateSitemapUrls();
    console.log(`Generated ${urls.length} URLs`);

    // Generate XML
    const sitemapXML = generateSitemapXML(urls);

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, sitemapXML, 'utf8');
    console.log(`Sitemap generated successfully at: ${OUTPUT_PATH}`);
    console.log(`Total URLs: ${urls.length}`);

    // Also generate a sitemap index if you have many URLs (optional)
    if (urls.length > 50000) {
      console.log('Large sitemap detected. Consider splitting into multiple sitemaps.');
    }

    return urls.length;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap, generateSitemapUrls }; 