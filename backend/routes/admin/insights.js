const express = require("express");
const router = express.Router();
const TraceSession = require("../../models/TraceSessionModel");
const TraceEvent = require("../../models/TraceEventModel");
const TraceRecording = require("../../models/TraceRecordingModel");
const { fetchIpInfoForSpecificIP } = require("../../cron/ipFetcher");

router.get("/utm-sources", async (req, res) => {
  try {
    const sources = await TraceSession.distinct("utm.source");
    // Filter out null/undefined and sort
    const validSources = sources.filter(s => s && s.trim()).sort();
    res.sendSuccess(validSources);
  } catch (err) {
    res.sendError(err.message, "Failed to fetch UTM sources");
  }
});

router.get("/sessions", async (req, res) => {
  try {
    const { sortBy = 'createdAt', order = 'desc', utmSource, minViews, maxViews } = req.query;
    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    
    // Build filter query
    const filter = {};
    
    // UTM Source filter
    if (utmSource && utmSource !== 'all') {
      filter['utm.source'] = utmSource;
    }
    
    // Views filter
    if (minViews !== undefined && minViews !== '') {
      filter.pageViews = { $gte: parseInt(minViews) };
    }
    if (maxViews !== undefined && maxViews !== '') {
      if (filter.pageViews) {
        filter.pageViews.$lte = parseInt(maxViews);
      } else {
        filter.pageViews = { $lte: parseInt(maxViews) };
      }
    }
    
    const sessions = await TraceSession.find(filter)
      .sort({ [sortField]: sortOrder })
      .limit(100);
    res.sendSuccess(sessions);
  } catch (err) {
    res.sendError(err.message, "Failed to fetch sessions");
  }
});

router.get("/session/:sessionId", async (req, res) => {
  try {
    const session = await TraceSession.findOne({ sessionId: req.params.sessionId });
    const events = await TraceEvent.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
    res.sendSuccess({ session, events });
  } catch (err) {
    res.sendError(err.message, "Failed to fetch session details");
  }
});

router.get("/recording/:sessionId", async (req, res) => {
  try {
    const recordingChunks = await TraceRecording.find({ sessionId: req.params.sessionId }).sort({ chunkIndex: 1, createdAt: 1 });
    // Flatten chunks into a single array of events
    const events = recordingChunks.reduce((acc, chunk) => acc.concat(chunk.events), []);
    res.sendSuccess(events);
  } catch (err) {
    res.sendError(err.message, "Failed to fetch recording");
  }
});

router.post("/fetch-ip-info", async (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.sendError("IP address is required");
    }
    
    // Call the IP fetcher function for this specific IP
    const result = await fetchIpInfoForSpecificIP(ip);
    
    if (result.error) {
      return res.sendError(result.error, "Failed to fetch IP info");
    }
    
    res.sendSuccess({
      ip: ip,
      processed: result.processed,
      country: result.country,
      skipped: result.skipped || false,
      reason: result.reason || null
    });
  } catch (err) {
    res.sendError(err.message, "Failed to fetch IP info");
  }
});

module.exports = router;
