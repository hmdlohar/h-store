class BaseShippingProvider {
  constructor(config, providerName) {
    this.config = config;
    this.providerName = providerName;
  }

  /**
   * Create a shipment/order
   * @param {Object} order - Order details
   * @param {Object} options - Shipping options
   * @returns {Object} - Shipping response with tracking details
   */
  async createShipment(order, options) {
    throw new Error("createShipment must be implemented by subclass");
  }

  /**
   * Cancel a shipment
   * @param {string} shipmentId - Shipment ID or AWB
   * @returns {Object} - Cancel response
   */
  async cancelShipment(shipmentId) {
    throw new Error("cancelShipment must be implemented by subclass");
  }

  /**
   * Track a shipment
   * @param {string} trackingNumber - AWB/Tracking number
   * @returns {Object} - Tracking details
   */
  async trackShipment(trackingNumber) {
    throw new Error("trackShipment must be implemented by subclass");
  }

  /**
   * Generate a shipping label
   * @param {string} shipmentId - Shipment ID
   * @returns {Object} - Label URL or PDF
   */
  async generateLabel(shipmentId) {
    throw new Error("generateLabel must be implemented by subclass");
  }

  /**
   * Check pincode serviceability
   * @param {string} pincode - Delivery pincode
   * @param {Object} options - Additional options
   * @returns {Object} - Serviceability info
   */
  async checkServiceability(pincode, options) {
    throw new Error("checkServiceability must be implemented by subclass");
  }

  /**
   * Get provider name
   */
  getName() {
    return this.providerName;
  }

  /**
   * Get provider display name
   */
  getDisplayName() {
    return this.providerName;
  }

  /**
   * Validate order data for shipping
   */
  validateOrder(order) {
    const errors = [];

    if (!order) {
      errors.push("Order is required");
      return { valid: false, errors };
    }

    if (!order.deliveryAddress) {
      errors.push("Delivery address is required");
    }

    if (!order.deliveryAddress?.pincode) {
      errors.push("Delivery pincode is required");
    }

    if (!order.deliveryAddress?.mobile) {
      errors.push("Delivery mobile number is required");
    }

    if (!order.items || order.items.length === 0) {
      errors.push("Order must have at least one item");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate total weight and dimensions from order items
   */
  calculatePackageDetails(order, productsMap = {}) {
    let totalWeight = 0;
    let totalLength = 0;
    let totalBreadth = 0;
    let totalHeight = 0;

    order.items.forEach((item) => {
      const product = productsMap[item.productId] || {};
      const shipping = product.shipping || {};
      const weight = shipping.weight || 0;
      const length = shipping.length || 0;
      const breadth = shipping.breadth || 0;
      const height = shipping.height || 0;
      const quantity = item.quantity || 1;

      totalWeight += weight * quantity;
      totalLength += length * quantity;
      totalBreadth += breadth * quantity;
      totalHeight += height * quantity;
    });

    return {
      weight: totalWeight || 500, // Default 500g if not set
      length: totalLength || 10, // Default 10cm if not set
      breadth: totalBreadth || 10,
      height: totalHeight || 10,
    };
  }
}

module.exports = BaseShippingProvider;
