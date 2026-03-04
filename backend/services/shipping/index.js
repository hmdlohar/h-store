const DelhiveryProvider = require("./DelhiveryProvider");
const ShiprocketProvider = require("./ShiprocketProvider");
const shippingConfig = require("../../config/shipping");

class ShippingService {
  constructor(config = shippingConfig) {
    this.config = config;
    this.providers = {};
    this.initializeProviders();
  }

  initializeProviders() {
    if (this.config.providers?.delhivery?.enabled) {
      this.providers.delhivery = new DelhiveryProvider(this.config);
    }

    if (this.config.providers?.shiprocket?.enabled) {
      this.providers.shiprocket = new ShiprocketProvider(this.config);
    }
  }

  getProvider(providerName) {
    const provider = this.providers[providerName?.toLowerCase()];
    if (!provider) {
      throw new Error(`Shipping provider '${providerName}' not found or not enabled`);
    }
    return provider;
  }

  getAvailableProviders() {
    return Object.entries(this.providers).map(([key, provider]) => ({
      id: key,
      name: provider.getName(),
      displayName: provider.getDisplayName(),
    }));
  }

  getDefaultProvider() {
    const defaultProvider = this.config.defaultProvider;
    if (this.providers[defaultProvider]) {
      return {
        id: defaultProvider,
        name: this.providers[defaultProvider].getName(),
        displayName: this.providers[defaultProvider].getDisplayName(),
      };
    }
    return this.getAvailableProviders()[0];
  }

  async createShipment(order, providerName, options = {}) {
    const provider = this.getProvider(providerName);
    const result = await provider.createShipment(order, options);
    return result;
  }

  async createShipmentWithProvider(order, options = {}) {
    const providerName = options.provider || this.config.defaultProvider;
    return this.createShipment(order, providerName, options);
  }

  async cancelShipment(providerName, shipmentId) {
    const provider = this.getProvider(providerName);
    return provider.cancelShipment(shipmentId);
  }

  async trackShipment(providerName, trackingNumber) {
    const provider = this.getProvider(providerName);
    return provider.trackShipment(trackingNumber);
  }

  async generateLabel(providerName, shipmentId) {
    const provider = this.getProvider(providerName);
    return provider.generateLabel(shipmentId);
  }

  async checkServiceability(providerName, pincode, options) {
    const provider = this.getProvider(providerName);
    return provider.checkServiceability(pincode, options);
  }

  getPickupAddresses() {
    return this.config.pickupAddresses || [];
  }

  getDefaultPickupAddress() {
    const defaultId = this.config.defaultPickupAddressId;
    return this.config.pickupAddresses?.find(p => p.id === defaultId) 
      || this.config.pickupAddresses?.[0];
  }
}

module.exports = new ShippingService(shippingConfig);
