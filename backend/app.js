require("dotenv").config();
require("./instrument");
const Sentry = require("@sentry/node");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const config = require("./config");
const api = require("./routes/api");
const cors = require("cors");
const path = require("path");
const { initCron } = require("./cron/init-cron");
const postHog = require("./services/PostHogService");
const trackRequest = require("./middlewares/trackRequest");
const cookieParser = require("cookie-parser");
const app = express();

// Global error handlers for uncaught exceptions and unhandled promises
process.on("uncaughtException", (err) => {
  // console.error('UNCAUGHT EXCEPTION:', err);
  Sentry.captureException(err);
});

process.on("unhandledRejection", (err) => {
  // console.error('UNHANDLED REJECTION:', err);
  Sentry.captureException(err);
});

mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log(`mongo is connected.`);
    initCron();
  })
  .catch((err) => {
    console.log(`Can't connect mongo ${err.toString()}. `);
  });

// It is used to parse application/json data came in request body.
// Increased limit to 10MB for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Allow Cross origin request to this server
app.use(cors());

// Parse cookies (needed for PostHog distinct_id)
app.use(cookieParser());

// Track all incoming requests for analytics
app.use(trackRequest);

app.use("/api", api);

app.use("/", express.static("./web"));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "web", "index.html"));
});

Sentry.setupExpressErrorHandler(app);

// Final error handling middleware - catches ALL errors
app.use((err, req, res, next) => {
  // Log the error
  console.error("Error caught by express:", err);

  // Send to Sentry if available
  if (Sentry) {
    Sentry.captureException(err);
  }

  // If headers are already sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // If the error has a status code, use it, otherwise default to 500
  const statusCode = err.status || err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    status: false,
    error: err.name || "Error",
    message: err.message || "Something went wrong",
  });
});

const server = http.createServer(app);
server.listen(config.PORT, () => {
  console.log("listening on port " + config.PORT);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  postHog.shutdown();
  // Close your server, database connections, etc.
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  postHog.shutdown();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
