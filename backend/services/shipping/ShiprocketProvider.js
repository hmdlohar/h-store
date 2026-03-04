const BaseShippingProvider = require("./BaseShippingProvider");
const axios = require("axios");

class ShiprocketProvider extends BaseShippingProvider {
  constructor(config) {
    super(config, "shiprocket");
    this.email = config.providers?.shiprocket?.email;
    this.password = config.providers?.shiprocket?.password;
    this.testMode = config.providers?.shiprocket?.testMode ?? true;

    this.baseUrl = this.testMode
      ? "https://apiv2staging.shiprocket.in/v1"
      : "https://apiv2.shiprocket.in/v1";

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.token = null;
    this.tokenExpiry = null;
  }

  getDisplayName() {
    return "Shiprocket";
  }

  async authenticate() {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await this.client.post("/external/auth/login", {
        email: this.email,
        password: this.password,
      });

      if (response.data?.token) {
        this.token = response.data.token;
        this.tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes buffer
        return this.token;
      }

      throw new Error("Failed to get authentication token");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Shiprocket Auth Error: ${errorMessage}`);
    }
  }

  async getAuthHeaders() {
    const token = await this.authenticate();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async createShipment(order, options = {}) {
    const validation = this.validateOrder(order);
    if (!validation.valid) {
      throw new Error(
        `Order validation failed: ${validation.errors.join(", ")}`,
      );
    }

    const pickupAddress =
      options.pickupAddress ||
      this.config.pickupAddresses.find(
        (p) => p.id === this.config.defaultPickupAddressId,
      );
    const packageDetails = this.calculatePackageDetails(
      order,
      options.productsMap,
    );

    const isCOD = order.pg === "cod" || order.paymentMethod === "COD";
    const paymentMethod = isCOD ? "COD" : "Prepaid";

    const orderPayload = {
      order_id: order.orderNumber || order._id,
      order_date: order.createdAt
        ? new Date(order.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      pickup_location:
        pickupAddress?.shiprocketName || pickupAddress?.name || "default",
      billing_customer_name: order.deliveryAddress?.name || "Customer",
      billing_last_name: "",
      billing_address: order.deliveryAddress?.home || "",
      billing_address_2: order.deliveryAddress?.area || "",
      billing_city: order.deliveryAddress?.city || "",
      billing_state: order.deliveryAddress?.state || "",
      billing_country: "India",
      billing_pincode: order.deliveryAddress?.pincode || "",
      billing_phone: order.deliveryAddress?.mobile || "",
      billing_email: order.deliveryAddress?.email || "",
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.productName || "Product",
        sku: item.productId || "SKU",
        units: item.quantity || 1,
        selling_price: item.price || 0,
        price: item.price || 0,
      })),
      payment_method: paymentMethod,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.subTotal || order.amount,
      length: packageDetails.length,
      breadth: packageDetails.breadth,
      height: packageDetails.height,
      weight: packageDetails.weight / 1000, // Convert to kg
    };

    try {
      const headers = await this.getAuthHeaders();
      const response = await this.client.post(
        "/external/orders/create/adhoc",
        orderPayload,
        { headers },
      );

      if (response.data?.shipment_id) {
        return {
          success: true,
          provider: "shiprocket",
          orderId: order.orderNumber || order._id,
          shipmentId: response.data.shipment_id,
          trackingNumber: response.data.awb_code,
          labelUrl: response.data.label_url,
          manifestUrl: response.data.manifest_url,
          status: response.data.status,
          response: response.data,
        };
      }

      console.log("Shiprocket response:", JSON.stringify(response.data));

      if (response.data?.error_message) {
        throw new Error(response.data.error_message);
      }

      if (response.data?.message && !response.data?.shipment_id) {
        throw new Error(response.data.message);
      }

      return {
        success: true,
        provider: "shiprocket",
        orderId: order.orderNumber || order._id,
        response: response.data,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error_message ||
        error.response?.data?.message ||
        error.message;
      throw new Error(`Shiprocket API Error: ${errorMessage}`);
    }
  }

  async cancelShipment(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.client.post(
        "/external/orders/cancel",
        {
          ids: [shipmentId],
        },
        { headers },
      );

      return {
        success: true,
        provider: "shiprocket",
        shipmentId,
        response: response.data,
      };
    } catch (error) {
      throw new Error(`Shiprocket Cancel Error: ${error.message}`);
    }
  }

  async trackShipment(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.client.get(
        `/external/shipments/${shipmentId}/track`,
        { headers },
      );

      if (response.data?.tracking_data) {
        return {
          success: true,
          provider: "shiprocket",
          shipmentId,
          status: response.data.tracking_data?.shipment_status,
          currentStatus: response.data.tracking_data?.current_status,
          trackingHistory: response.data.tracking_data?.tracking,
        };
      }

      return {
        success: false,
        provider: "shiprocket",
        shipmentId,
        message: "Tracking information not found",
      };
    } catch (error) {
      throw new Error(`Shiprocket Tracking Error: ${error.message}`);
    }
  }

  async generateLabel(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();

      // First generate label
      await this.client.post(
        "/external/label/generate",
        {
          shipment_id: [shipmentId],
        },
        { headers },
      );

      // Then get the label URL
      const response = await this.client.get(
        `/external/shipments/${shipmentId}/label`,
        { headers },
      );

      return {
        success: true,
        provider: "shiprocket",
        shipmentId,
        labelUrl: response.data?.label_url,
        response: response.data,
      };
    } catch (error) {
      throw new Error(`Shiprocket Label Error: ${error.message}`);
    }
  }

  async checkServiceability(pincode, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.client.get(
        "/external/courier/serviceability/",
        {
          params: {
            pickup_pincode:
              options.pickupPincode || this.config.pickupAddresses[0]?.pincode,
            delivery_pincode: pincode,
            weight: options.weight || 1,
          },
          headers,
        },
      );

      if (response.data?.courier_available) {
        const couriers = response.data.available_courier_companies || [];
        return {
          success: true,
          pincode,
          serviceable: couriers.length > 0,
          couriers: couriers.map((c) => ({
            name: c.courier_name,
            rating: c.rating,
            deliveryDays: c.delivery_days,
            cost: c.rate,
          })),
        };
      }

      return {
        success: true,
        pincode,
        serviceable: false,
        message: "No couriers available",
      };
    } catch (error) {
      throw new Error(`Shiprocket Serviceability Error: ${error.message}`);
    }
  }
}

module.exports = ShiprocketProvider;
