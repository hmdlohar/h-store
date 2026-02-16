const express = require("express");
const router = express.Router();
const TraceSession = require("../models/TraceSessionModel");
const TraceEvent = require("../models/TraceEventModel");
const TraceRecording = require("../models/TraceRecordingModel");

// Async tracking to ensure frontend doesn't wait
const trackAsync = (fn) => {
  fn().catch((err) => console.error("Sync error:", err));
};

router.post("/open", async (req, res) => {
  const { sessionId, userAgent, ip, utm, screenWidth, screenHeight } = req.body;
  console.log(`Tracking hit: ${sessionId} from ${ip}`);

  if (!sessionId) {
    return res.sendError("Session ID required");
  }

  trackAsync(async () => {
    let session = await TraceSession.findOne({ sessionId });
    if (!session) {
      session = new TraceSession({
        sessionId,
        userAgent,
        ip: ip || req.ip,
        utm,
        screenWidth,
        screenHeight,
      });
      await session.save();
    } else {
      // Update screen info if it was missing
      if (screenWidth && !session.screenWidth) {
        session.screenWidth = screenWidth;
        session.screenHeight = screenHeight;
        await session.save();
      }
    }
  });

  res.sendSuccess({ s: true });
});

router.post("/push", async (req, res) => {
  const { sessionId, type, path, data } = req.body;

  if (!sessionId || !type) {
    return res.sendError("Session and type required");
  }

  trackAsync(async () => {
    const event = new TraceEvent({
      sessionId,
      type,
      path,
      data,
    });
    await event.save();

    if (type === "pageview") {
      const updateData = { $inc: { pageViews: 1 } };
      if (data?.screenWidth) {
        updateData.screenWidth = data.screenWidth;
        updateData.screenHeight = data.screenHeight;
      }
      await TraceSession.updateOne({ sessionId }, updateData);
    }
  });

  res.sendSuccess({ s: true });
});

router.post("/blob", async (req, res) => {
  const { sessionId, events, chunkIndex } = req.body;

  if (!sessionId || !events || !events.length) {
    return res.sendSuccess({ s: true }); // No events to save
  }

  trackAsync(async () => {
    const recording = new TraceRecording({
      sessionId,
      events,
      chunkIndex,
    });
    await recording.save();
  });

  res.sendSuccess({ s: true });
});

module.exports = router;
