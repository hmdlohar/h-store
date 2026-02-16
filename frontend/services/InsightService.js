import { ApiService } from "./ApiService";
import Cookies from "js-cookie";

class InsightService {
  constructor() {
    this.sessionId = null;
    this.recordingStarted = false;
    this.eventBuffer = [];
    this.recordingBuffer = [];
    this.flushInterval = 2000; // 2 seconds
    this.stopRecording = null;
    this.rrweb = null;
  }

  shouldExclude() {
    if (typeof window === "undefined") return true;
    return window.location.pathname.startsWith("/admin");
  }

  init() {
    if (typeof window === "undefined" || this.shouldExclude()) return;

    this.sessionId = Cookies.get("tsid");
    if (!this.sessionId) {
      this.sessionId = Math.random().toString(36).substring(2, 15);
      Cookies.set("tsid", this.sessionId, { expires: 30, path: "/" });
    }

    this.startFlushInterval();
    this.trackPageView();
    this.startRecording();
  }

  trackPageView() {
    if (typeof window === "undefined" || this.shouldExclude()) return;
    this.trackEvent("pageview", {
      url: window.location.href,
      referrer: document.referrer,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    });
  }

  async trackEvent(type, data = {}) {
    if (!this.sessionId || this.shouldExclude()) return;
    
    const event = {
      sessionId: this.sessionId,
      type,
      path: typeof window !== "undefined" ? window.location.pathname : "",
      data,
      timestamp: new Date().toISOString(),
    };

    ApiService.call("/api/v1/u-sync/push", "post", event).catch(() => {});
  }

  async startRecording() {
    if (this.recordingStarted || typeof window === "undefined" || this.shouldExclude()) return;
    
    try {
      if (!this.rrweb) {
        this.rrweb = await import("rrweb");
      }

      this.stopRecording = this.rrweb.record({
        emit: (event) => {
          // Double check during recording to stop if user navigates to admin
          if (this.shouldExclude()) {
            if (this.stopRecording) {
               this.stopRecording();
               this.recordingStarted = false;
            }
            return;
          }
          this.recordingBuffer.push(event);
          if (this.recordingBuffer.length >= 50) {
            this.flushRecording();
          }
        },
        sampling: {
          mousemove: false,
          scroll: 150,
        }
      });
      this.recordingStarted = true;
    } catch (e) {
      // Silently fail to avoid console alerts in some browsers
    }
  }

  async flushEvents() {
    if (this.eventBuffer.length === 0 || this.shouldExclude()) return;
    const events = [...this.eventBuffer];
    this.eventBuffer = [];
    for (const event of events) {
      ApiService.call("/api/v1/u-sync/push", "post", event).catch(() => {});
    }
  }

  async flushRecording() {
    if (this.recordingBuffer.length === 0 || !this.sessionId || this.shouldExclude()) return;
    
    const events = [...this.recordingBuffer];
    this.recordingBuffer = [];

    ApiService.call("/api/v1/u-sync/blob", "post", {
      sessionId: this.sessionId,
      events,
    }).catch(() => {});
  }

  startFlushInterval() {
    if (typeof window === "undefined" || this.shouldExclude()) return;
    setInterval(() => {
      this.flushEvents();
      this.flushRecording();
    }, this.flushInterval);
  }
}

export const insightService = new InsightService();
