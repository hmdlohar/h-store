import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Grid,
  Button,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StoreIcon from "@mui/icons-material/Store";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import { useState } from "react";

const statusColors = {
  paid: "success",
  pending: "warning",
  cancelled: "error",
  delivered: "info",
  processing: "secondary",
};

export default function OrderDetailModal({ open, onClose, order }) {
  const orderId = order?._id;
  const [shippingAnchorEl, setShippingAnchorEl] = useState(null);

  const { data: providersData } = useQuery({
    queryKey: ["shipping-providers"],
    queryFn: async () => {
      const res = await ApiService.call("/api/admin/shipping/providers", "get");
      return res;
    },
    staleTime: 5 * 60 * 1000,
  });

  const shipOrderMutation = useMutation({
    mutationFn: async (provider) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return await ApiService.call(`/api/admin/shipping/${orderId}/ship-with/${provider}`, "post", {});
    },
    onSuccess: (data) => {
      alert(`Order shipped successfully! Tracking: ${data.trackingNumber || 'N/A'}`);
      setShippingAnchorEl(null);
    },
    onError: (error) => {
      alert(error?.response?.data?.msg || error?.message || "Failed to ship order");
    },
  });

  const providers = providersData?.providers || [];
  const existingShipments = order?.shipping?.shipments || [];
  const hmdappOrderId = order?.info?.hmdappOrderId;
  
  // Check if order has customization
  const orderItems = order?.items?.[0] || {};
  const customization = orderItems?.customization || {};
  const hasCustomization = !!(customization.Name || customization.name || customization.Name2 || customization.name2 || customization.Color || customization.color);

  const addToHmdappMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return await ApiService.call(`/api/admin/shipping/${orderId}/add-to-hmdapp`, "post", {});
    },
    onSuccess: (data) => {
      alert(`Order added to hmdapp! Order ID: ${data.hmdappOrderId || 'N/A'}`);
    },
    onError: (error) => {
      alert(error?.response?.data?.msg || error?.message || "Failed to add to hmdapp");
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (channel) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return await ApiService.call(`/api/admin/orders/${orderId}/send-order-placed`, "post", {
        channel,
      });
    },
    onSuccess: (_, channel) => {
      alert(
        channel === "email"
          ? "Order placed email sent successfully."
          : "Order placed WhatsApp sent successfully.",
      );
    },
    onError: (error) => {
      alert(error?.response?.data?.msg || error?.message || "Failed to send message");
    },
  });

  if (!order) return null;

  const formattedDate = order.createdAt
    ? format(new Date(order.createdAt), "MMM dd, yyyy • h:mm a")
    : "N/A";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6">Order #{order.orderNumber}</Typography>
          <Typography variant="caption" color="text.secondary">
            {formattedDate}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Order Items */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Order Items
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item, index) => (
                    <TableRow key={item._id || index}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar
                            src={
                              item.product?.mainImage?.imagePath
                                ? `/uploads/${item.product.mainImage.imagePath}`
                                : "/placeholder.png"
                            }
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box>
                            <Typography variant="body2">
                              {item.productName}
                            </Typography>
                            {item.customization &&
                              Object.keys(item.customization).length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  {Object.entries(item.customization)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(", ")}
                                </Typography>
                              )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">₹{item.price}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₹{item.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Delivery Address */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Delivery Address
            </Typography>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>{order.deliveryAddress?.name}</strong>
              </Typography>
              <Typography variant="body2">
                {order.deliveryAddress?.home}, {order.deliveryAddress?.area}
              </Typography>
              <Typography variant="body2">
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{" "}
                {order.deliveryAddress?.pincode}
              </Typography>
              <Typography variant="body2">
                Phone: {order.deliveryAddress?.mobile}
              </Typography>
            </Box>
          </Grid>

          {/* Payment Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Payment Information
            </Typography>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body2">{order.pg}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{order.amount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={order.status}
                    size="small"
                    color={statusColors[order.status] || "default"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                    {order.pgOrderID || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          onClick={() => sendMessageMutation.mutate("whatsapp")}
          disabled={sendMessageMutation.isPending}
        >
          Send Order Placed WhatsApp
        </Button>
        <Button
          variant="outlined"
          onClick={() => sendMessageMutation.mutate("email")}
          disabled={sendMessageMutation.isPending}
        >
          Send Order Placed Email
        </Button>
        
        {/* Shipping Buttons */}
        {providers.length > 0 && (
          <>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<LocalShippingIcon />}
              onClick={(e) => setShippingAnchorEl(e.currentTarget)}
              disabled={shipOrderMutation.isPending}
            >
              Add to Shipping
            </Button>
            <Menu
              anchorEl={shippingAnchorEl}
              open={Boolean(shippingAnchorEl)}
              onClose={() => setShippingAnchorEl(null)}
            >
              {providers.map((provider) => {
                const isAlreadyShipped = existingShipments.some(s => s.provider === provider.id);
                return (
                  <MenuItem
                    key={provider.id}
                    onClick={() => {
                      setShippingAnchorEl(null);
                      if (!isAlreadyShipped) {
                        shipOrderMutation.mutate(provider.id);
                      }
                    }}
                    disabled={isAlreadyShipped || shipOrderMutation.isPending}
                  >
                    <ListItemIcon>
                      <LocalShippingIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                      {isAlreadyShipped ? `${provider.displayName} (Already Shipped)` : `Add to ${provider.displayName}`}
                    </ListItemText>
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}

        {/* Hmdapp Button */}
        <Button
          variant="contained"
          color="info"
          startIcon={<StoreIcon />}
          onClick={() => addToHmdappMutation.mutate()}
          disabled={addToHmdappMutation.isPending || !!hmdappOrderId || !hasCustomization}
          title={!hasCustomization ? "Order must have customization (Name or Color) to add to Hmdapp" : ""}
        >
          {hmdappOrderId ? `Hmdapp: ${hmdappOrderId}` : "Add to Hmdapp"}
        </Button>

        {/* Show existing shipments */}
        {existingShipments.length > 0 && (
          <Box sx={{ width: '100%', mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {existingShipments.map((shipment, index) => (
              <Chip
                key={index}
                label={`${shipment.provider}: ${shipment.trackingNumber || shipment.shipmentId || 'No AWB'}`}
                color="success"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        )}

        <Button variant="outlined" color="primary">
          Update Status
        </Button>
        <Button variant="contained" color="primary">
          Print Invoice
        </Button>
      </Box>
    </Dialog>
  );
}
