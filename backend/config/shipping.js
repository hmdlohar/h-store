const shippingConfig = {
  // Pickup addresses - used by shipping providers
  pickupAddresses: [
    {
      id: "default",
      name: "Sajiya Gifts",
      shiprocketName: "Home",
      email: "hmdlohar@gmail.com",
      phone: "8980254480",
      address: "26, Mehrun city, Airport Ring Rd, Railway Area, Bhuj",
      city: "Bhuj",
      state: "Gujarat",
      pincode: "370001",
      country: "India",
    },
  ],

  // Default pickup address ID
  defaultPickupAddressId: "default",

  // Shipping provider configurations
  providers: {
    delhivery: {
      enabled: true,
      apiToken: process.env.DELHIVERY_API_TOKEN || "",
      testMode: false, // Use staging API
      warehouse: process.env.DELHIVERY_WAREHOUSE || "Sajiya Gifts",
    },
    shiprocket: {
      enabled: true,
      email: process.env.SHIPROCKET_EMAIL || "",
      password: process.env.SHIPROCKET_PASSWORD || "",
      testMode: false, // Use staging API
    },
  },

  // Default shipping provider
  defaultProvider: "delhivery",
};

module.exports = shippingConfig;
