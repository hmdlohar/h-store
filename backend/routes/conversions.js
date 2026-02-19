const express = require("express");
const conversionsApiService = require("../services/ConversionsApiService");

const router = express.Router();

// Track event from frontend (for Conversions API)
router.post("/track", async (req, res) => {
  try {
    const { eventName, eventId, params, url, referrer } = req.body;

    if (!eventName || !eventId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get client IP and user agent
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Get fbp cookie if available
    const fbp = req.cookies?._fbp;

    // Prepare event data
    const eventData = {
      eventName,
      eventId,
      params,
      url,
      referrer,
      fbp,
      userId: req.user?._id,
    };

    // Send to Conversions API (don't wait for response to avoid delaying client)
    conversionsApiService
      .sendEvent(eventData, clientIp, userAgent)
      .catch((err) => {
        console.error("Failed to send to Conversions API:", err.message);
      });

    res.json({ success: true });
  } catch (error) {
    console.error("Conversions tracking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Server-side Purchase event (for backend order completion)
router.post("/purchase", async (req, res) => {
  try {
    const { orderId, value, currency, contents, userData } = req.body;

    const eventId = `purchase-${orderId}-${Date.now()}`;

    const eventData = {
      eventName: "Purchase",
      eventId,
      params: {
        value,
        currency,
        order_id: orderId,
        contents,
        num_items: contents?.length || 1,
      },
      url: userData?.url || `${process.env.FRONTEND_URL}/order-success/${orderId}`,
      ...userData,
    };

    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    await conversionsApiService.sendEvent(eventData, clientIp, userAgent);

    res.json({ success: true, eventId });
  } catch (error) {
    console.error("Purchase tracking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
