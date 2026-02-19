import { ApiService } from "./ApiService";

class FacebookPixelService {
  constructor() {
    this.pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "3168601370008522";
    this.isInitialized = false;
  }

  shouldTrack() {
    if (typeof window === "undefined") return false;
    return !!window.fbq;
  }

  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  track(eventName, params = {}, eventId = null) {
    if (!this.shouldTrack()) return;

    const id = eventId || this.generateEventId();
    
    // Track client-side with Pixel
    window.fbq("track", eventName, params, { eventID: id });

    // Also send to backend for Conversions API
    this.sendToConversionsApi(eventName, params, id);

    return id;
  }

  trackCustom(eventName, params = {}, eventId = null) {
    if (!this.shouldTrack()) return;

    const id = eventId || this.generateEventId();
    
    window.fbq("trackCustom", eventName, params, { eventID: id });
    this.sendToConversionsApi(eventName, params, id);

    return id;
  }

  async sendToConversionsApi(eventName, params, eventId) {
    try {
      const payload = {
        eventName,
        eventId,
        params,
        url: typeof window !== "undefined" ? window.location.href : "",
        referrer: typeof window !== "undefined" ? document.referrer : "",
      };

      // Fire and forget - don't wait for response
      ApiService.call("/api/conversions/track", "post", payload).catch(() => {});
    } catch (e) {
      // Silently fail
    }
  }

  // Standard e-commerce events
  viewContent(params) {
    return this.track("ViewContent", params);
  }

  addToCart(params) {
    return this.track("AddToCart", params);
  }

  initiateCheckout(params) {
    return this.track("InitiateCheckout", params);
  }

  purchase(params) {
    return this.track("Purchase", params);
  }

  lead(params) {
    return this.track("Lead", params);
  }

  completeRegistration(params) {
    return this.track("CompleteRegistration", params);
  }
}

export const fbPixel = new FacebookPixelService();
