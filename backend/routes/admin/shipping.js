const express = require("express");
const router = express.Router();
const OrderModel = require("../../models/OrderModel");
const ProductModel = require("../../models/ProductModel");
const shippingService = require("../../services/shipping");

router.get("/providers", async (req, res) => {
  try {
    const providers = shippingService.getAvailableProviders();
    const defaultProvider = shippingService.getDefaultProvider();
    const pickupAddresses = shippingService.getPickupAddresses();

    res.sendSuccess({
      providers,
      defaultProvider,
      pickupAddresses,
    });
  } catch (error) {
    console.error("Error fetching shipping providers:", error);
    res.sendError("Failed to fetch shipping providers", 500);
  }
});

router.post("/:id/ship-with/:provider", async (req, res) => {
  const { id, provider } = req.params;
  const { pickupAddressId } = req.body;

  try {
    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res.sendError("notFound", "Order not found", 404);
    }

    if (order.shipping?.shipments?.some(s => s.provider === provider)) {
      return res.sendError("alreadyShipped", "Order already shipped with this provider", 400);
    }

    const productIds = order.items.map(item => item.productId);
    const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
    const productsMap = products.reduce((acc, product) => {
      acc[product._id] = product;
      return acc;
    }, {});

    const pickupAddress = pickupAddressId 
      ? shippingService.getPickupAddresses().find(p => p.id === pickupAddressId)
      : shippingService.getDefaultPickupAddress();

    const result = await shippingService.createShipment(order, provider, {
      pickupAddress,
      productsMap,
    });

    const shippingUpdate = {
      provider: result.provider,
      shipmentId: result.shipmentId,
      trackingNumber: result.trackingNumber,
      labelUrl: result.labelUrl,
      shippedAt: new Date(),
      status: result.status,
      response: result.response,
    };

    await OrderModel.findByIdAndUpdate(id, {
      $push: { "shipping.shipments": shippingUpdate },
    });

    res.sendSuccess(result, "Order added to shipping successfully");
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.sendError(`Failed to create shipment: ${error.message}`, 500);
  }
});

router.get("/:id/shipping-status", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res.sendError("notFound", "Order not found", 404);
    }

    const shipments = order.shipping?.shipments || [];
    const trackingResults = await Promise.all(
      shipments.map(async (shipment) => {
        try {
          const tracking = await shippingService.trackShipment(
            shipment.provider,
            shipment.trackingNumber
          );
          return { ...shipment, tracking };
        } catch (error) {
          return { ...shipment, trackingError: error.message };
        }
      })
    );

    res.sendSuccess({
      orderId: order.orderNumber || id,
      shipments: trackingResults,
    });
  } catch (error) {
    console.error("Error fetching shipping status:", error);
    res.sendError("Failed to fetch shipping status", 500);
  }
});

router.post("/:id/track-shipment/:provider", async (req, res) => {
  const { id, provider } = req.params;

  try {
    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res.sendError("notFound", "Order not found", 404);
    }

    const shipment = order.shipping?.shipments?.find(s => s.provider === provider);
    if (!shipment?.trackingNumber) {
      return res.sendError("noShipment", "No shipment found for this provider", 404);
    }

    const tracking = await shippingService.trackShipment(provider, shipment.trackingNumber);
    res.sendSuccess(tracking);
  } catch (error) {
    console.error("Error tracking shipment:", error);
    res.sendError(`Failed to track shipment: ${error.message}`, 500);
  }
});

router.post("/:id/cancel-shipment/:provider", async (req, res) => {
  const { id, provider } = req.params;

  try {
    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res.sendError("notFound", "Order not found", 404);
    }

    const shipment = order.shipping?.shipments?.find(s => s.provider === provider);
    if (!shipment?.shipmentId) {
      return res.sendError("noShipment", "No shipment found for this provider", 404);
    }

    const result = await shippingService.cancelShipment(provider, shipment.shipmentId);

    await OrderModel.findByIdAndUpdate(id, {
      $set: { "shipping.shipments.$[elem].status": "cancelled" },
      arrayFilters: [{ "elem.provider": provider }],
    });

    res.sendSuccess(result, "Shipment cancelled successfully");
  } catch (error) {
    console.error("Error cancelling shipment:", error);
    res.sendError(`Failed to cancel shipment: ${error.message}`, 500);
  }
});

router.get("/:id/generate-label/:provider", async (req, res) => {
  const { id, provider } = req.params;

  try {
    const order = await OrderModel.findById(id).lean();
    if (!order) {
      return res.sendError("notFound", "Order not found", 404);
    }

    const shipment = order.shipping?.shipments?.find(s => s.provider === provider);
    if (!shipment?.shipmentId) {
      return res.sendError("noShipment", "No shipment found for this provider", 404);
    }

    const label = await shippingService.generateLabel(provider, shipment.shipmentId);
    res.sendSuccess(label);
  } catch (error) {
    console.error("Error generating label:", error);
    res.sendError(`Failed to generate label: ${error.message}`, 500);
  }
});

module.exports = router;
