const express = require("express");
const router = express.Router();
const TraceSession = require("../../models/TraceSessionModel");
const TraceEvent = require("../../models/TraceEventModel");
const TraceRecording = require("../../models/TraceRecordingModel");

router.get("/sessions", async (req, res) => {
  try {
    const sessions = await TraceSession.find().sort({ createdAt: -1 }).limit(100);
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

module.exports = router;
