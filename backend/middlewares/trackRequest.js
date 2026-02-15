const postHog = require("../services/PostHogService");
const crypto = require("crypto");

// Track incoming requests for analytics
const trackRequest = (req, res, next) => {
  // Skip tracking for static assets and health checks
  if (
    req.path.startsWith("/static") ||
    req.path.startsWith("/api") ||
    req.path === "/health" ||
    req.path.startsWith("/_next") ||
    req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
  ) {
    return next();
  }

  // Priority for distinct_id:
  // 1. User ID if authenticated (best - persists across sessions)
  // 2. PostHog distinct_id from cookie (links with frontend)
  // 3. Visitor ID from frontend header
  // 4. Generate new UUID (fallback)
  let distinctId = null;
  
  if (req.user?._id) {
    // Authenticated user - use their ID (best for analytics)
    distinctId = req.user._id.toString();
  } else {
    // Check for PostHog's cookie (ph_phc_*_posthog)
    const posthogCookie = Object.keys(req.headers.cookie || {}).find(key => 
      key.startsWith('ph_') && key.includes('_posthog')
    );
    
    if (posthogCookie) {
      try {
        const cookieData = JSON.parse(decodeURIComponent(req.headers.cookie[posthogCookie]));
        distinctId = cookieData.distinct_id;
      } catch (e) {
        // Cookie parse failed, continue to next option
      }
    }
    
    // If no PostHog cookie, try visitor ID from frontend
    if (!distinctId) {
      distinctId = req.headers["x-ph-distinct-id"] || req.headers["x-visitor-id"];
    }
    
    // Fallback: generate new ID
    if (!distinctId) {
      distinctId = crypto.randomUUID();
    }
  }

  // Capture UTM parameters from query
  const utmSource = req.query.utm_source;
  const utmMedium = req.query.utm_medium;
  const utmCampaign = req.query.utm_campaign;
  const utmContent = req.query.utm_content;
  const utmTerm = req.query.utm_term;

  // Check if this is ad traffic
  const isAdTraffic = !!utmSource;

  // Track page view
  postHog.capture("page_view", {
    distinct_id: distinctId,
    path: req.path,
    url: req.originalUrl,
    method: req.method,
    user_agent: req.headers["user-agent"],
    ip: req.ip || req.connection?.remoteAddress,
    referer: req.headers.referer,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm,
    is_ad_traffic: isAdTraffic,
    is_authenticated: !!req.user?._id,
    timestamp: new Date().toISOString(),
  });

  // If it's ad traffic, track separately for easier analysis
  if (isAdTraffic) {
    postHog.capture("ad_landing_page_view", {
      distinct_id: distinctId,
      path: req.path,
      utm_source: utmSource,
      utm_medium: utmMedium || "unknown",
      utm_campaign: utmCampaign || "unknown",
    });
  }

  // Attach distinctId to request for use in route handlers
  req.distinctId = distinctId;

  next();
};

module.exports = trackRequest;
