const BaseShippingProvider = require("./BaseShippingProvider");
const axios = require("axios");

class DelhiveryProvider extends BaseShippingProvider {
  constructor(config) {
    super(config, "delhivery");
    this.apiToken = config.providers?.delhivery?.apiToken;
    this.warehouse = config.providers?.delhivery?.warehouse || "GiftSH";
    this.testMode = config.providers?.delhivery?.testMode ?? true;
    
    this.baseUrl = this.testMode
      ? "https://staging-express.delhivery.com"
      : "https://track.delhivery.com";
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Token ${this.apiToken}`,
      },
    });
  }

  getDisplayName() {
    return "Delhivery";
  }

  async checkServiceability(pincode) {
    try {
      const response = await this.client.get(`/c/api/pin-codes/json/?filter_codes=${pincode}`);
      
      if (response.data?.delivery_codes?.length > 0) {
        const data = response.data.delivery_codes[0];
        return {
          success: true,
          pincode,
          serviceable: data.od !== "NO",
          cod: data.cod === "Y",
          prepaid: data.prepaid === "Y",
          reversePickup: data.revpick === "Y",
          data: response.data,
        };
      }

      return {
        success: true,
        pincode,
        serviceable: false,
        message: "Pincode not found or not serviceable",
      };
    } catch (error) {
      throw new Error(`Delhivery Serviceability Error: ${error.message}`);
    }
  }

  async createShipment(order, options = {}) {
    const validation = this.validateOrder(order);
    if (!validation.valid) {
      throw new Error(`Order validation failed: ${validation.errors.join(", ")}`);
    }

    const deliveryPincode = order.deliveryAddress.pincode;
    
    // Check pincode serviceability
    const serviceability = await this.checkServiceability(deliveryPincode);
    if (!serviceability.serviceable) {
      throw new Error(`Pincode ${deliveryPincode} is not serviceable by Delhivery. Please use a different shipping provider or verify the pincode.`);
    }

    const pickupAddress = options.pickupAddress || this.config.pickupAddresses.find(p => p.id === this.config.defaultPickupAddressId);
    const packageDetails = this.calculatePackageDetails(order, options.productsMap);
    
    const isCOD = order.pg === "cod" || order.paymentMethod === "COD";
    const paymentMode = isCOD ? "COD" : "Prepaid";

    const shipmentPayload = {
      shipments: [
        {
          name: order.deliveryAddress.name,
          add: order.deliveryAddress.home,
          pin: order.deliveryAddress.pincode,
          city: order.deliveryAddress.city,
          state: order.deliveryAddress.state,
          country: "India",
          phone: order.deliveryAddress.mobile,
          order: order.orderNumber || order._id,
          payment_mode: paymentMode,
          return_pin: "",
          return_city: "",
          return_phone: "",
          return_add: "",
          return_state: "",
          return_country: "",
          products_desc: "",
          hsn_code: "",
          cod_amount: isCOD ? order.amount : "",
          order_date: order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "",
          total_amount: order.amount,
          seller_add: "",
          seller_name: "",
          seller_inv: "",
          quantity: order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1,
          waybill: "",
          shipment_width: Math.ceil(packageDetails.breadth),
          shipment_height: Math.ceil(packageDetails.height),
          weight: Math.ceil(packageDetails.weight / 1000),
          shipping_mode: "Surface",
          address_type: "",
        },
      ],
      pickup_location: {
        name: pickupAddress?.name || this.warehouse,
      },
    };

    const shipmentData = new URLSearchParams();
    shipmentData.append("format", "json");
    shipmentData.append("data", JSON.stringify(shipmentPayload));

    try {
      const response = await this.client.post("/api/cmu/create.json", shipmentData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      
      console.log("Delhivery response:", JSON.stringify(response.data));

      if (response.data?.success === false) {
        const errorMsg = response.data?.rmk || response.data?.error || "Unknown error";
        throw new Error(`Delhivery API Error: ${errorMsg}`);
      }

      if (response.data?.ShipmentData?.length > 0) {
        const shipment = response.data.ShipmentData[0];
        return {
          success: true,
          provider: "delhivery",
          orderId: order.orderNumber || order._id,
          shipmentId: shipment?.Shipment?.AWB,
          trackingNumber: shipment?.Shipment?.AWB,
          labelUrl: shipment?.Shipment?.label_url,
          status: shipment?.Shipment?.Status,
          response: response.data,
        };
      }

      if (response.data?.packages?.length > 0) {
        const pkg = response.data.packages[0];
        return {
          success: true,
          provider: "delhivery",
          orderId: order.orderNumber || order._id,
          shipmentId: pkg.waybill || pkg.awb,
          trackingNumber: pkg.waybill || pkg.awb,
          labelUrl: pkg.label_url,
          status: pkg.status,
          response: response.data,
        };
      }

      return {
        success: true,
        provider: "delhivery",
        orderId: order.orderNumber || order._id,
        response: response.data,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.rmk
        || error.response?.data?.response?.errors?.[0]
        || error.response?.data?.message
        || error.message;
      throw new Error(`Delhivery API Error: ${errorMessage}`);
    }
  }

  async cancelShipment(awb) {
    try {
      const response = await this.client.post("/api/v1/cancel/shipment/", {
        awb: awb,
        format: "json",
      });

      return {
        success: true,
        provider: "delhivery",
        awb,
        response: response.data,
      };
    } catch (error) {
      throw new Error(`Delhivery Cancel Error: ${error.message}`);
    }
  }

  async trackShipment(trackingNumber) {
    try {
      const response = await this.client.get(`/api/v1/packages/${trackingNumber}/?format=json`);
      
      if (response.data?.ShipmentData?.length > 0) {
        const shipment = response.data.ShipmentData[0];
        return {
          success: true,
          provider: "delhivery",
          trackingNumber,
          status: shipment?.Shipment?.Status?.Status,
          statusLocation: shipment?.Shipment?.Status?.StatusLocation,
          statusDateTime: shipment?.Shipment?.Status?.StatusDateTime,
          estimatedDelivery: shipment?.Shipment?.EDD,
          currentLocation: shipment?.Shipment?.CurrentLocation,
          response: response.data,
        };
      }

      return {
        success: false,
        provider: "delhivery",
        trackingNumber,
        message: "Tracking information not found",
      };
    } catch (error) {
      throw new Error(`Delhivery Tracking Error: ${error.message}`);
    }
  }

  async generateLabel(awb) {
    try {
      const response = await this.client.get(`/api/p/packing_slip/${awb}/?format=json`);
      
      return {
        success: true,
        provider: "delhivery",
        awb,
        labelUrl: response.request?.res?.responseUrl,
        response: response.data,
      };
    } catch (error) {
      throw new Error(`Delhivery Label Error: ${error.message}`);
    }
  }
}

module.exports = DelhiveryProvider;
