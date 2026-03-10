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
import CampaignIcon from "@mui/icons-material/Campaign";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PaymentIcon from "@mui/icons-material/Payment";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import { useState } from "react";
import EcomImage from "@/common/EcomImage";

function getIncludedGst(amount) {
  const numericAmount = Number(amount || 0);
  if (!numericAmount) return 0;
  return Number((numericAmount - numericAmount / 1.18).toFixed(2));
}

const statusColors = {
  paid: "success",
  pending: "warning",
  finalized: "warning",
  confirmed: "success",
  cancelled: "error",
  shipped: "primary",
  delivered: "info",
  processing: "secondary",
};

const orderStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "finalized", label: "Finalized" },
  { value: "confirmed", label: "Confirmed" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function isImageCustomizationValue(value) {
  if (typeof value !== "string") return false;
  return (
    value.startsWith("http") ||
    value.startsWith("uploads/") ||
    value.startsWith("/") ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(value)
  );
}

function isColorCustomizationValue(value) {
  if (typeof value !== "string") return false;
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function getCustomizationMeta(item, field) {
  const definitions =
    item?.product?.customizations || item?.customizations || [];
  return definitions.find((definition) => definition.field === field) || null;
}

function renderCustomizationValue(
  item,
  field,
  value,
  compact = false,
  onImageClick = null
) {
  const meta = getCustomizationMeta(item, field);
  const label = meta?.label || field;

  if (meta?.fieldType === "image" || (!meta?.fieldType && isImageCustomizationValue(value))) {
    return (
      <Box
        key={field}
        sx={{
          display: "flex",
          alignItems: compact ? "center" : "flex-start",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography variant={compact ? "caption" : "body2"} fontWeight={500}>
          {label}:
        </Typography>
        <Box
          onClick={() => onImageClick?.({ path: value, label })}
          sx={{
            cursor: onImageClick ? "pointer" : "default",
            display: "inline-flex",
          }}
        >
          <EcomImage
            path={value}
            alt={label}
            small
            style={{
              width: compact ? 36 : 72,
              height: compact ? 36 : 72,
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid rgba(0, 0, 0, 0.08)",
            }}
          />
        </Box>
      </Box>
    );
  }

  if (meta?.fieldType === "color" || (!meta?.fieldType && isColorCustomizationValue(value))) {
    const colorName =
      meta?.options?.find((option) => option.code === value)?.name || value;

    return (
      <Box
        key={field}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography variant={compact ? "caption" : "body2"} fontWeight={500}>
          {label}:
        </Typography>
        <Box
          sx={{
            width: compact ? 14 : 18,
            height: compact ? 14 : 18,
            borderRadius: "50%",
            bgcolor: value,
            border: value === "#FFFFFF" ? "1px solid #d0d0d0" : "none",
            flexShrink: 0,
          }}
        />
        <Typography variant={compact ? "caption" : "body2"}>
          {colorName}
        </Typography>
      </Box>
    );
  }

  return (
    <Typography key={field} variant={compact ? "caption" : "body2"}>
      <Box component="span" fontWeight={500}>
        {label}:
      </Box>{" "}
      {String(value)}
    </Typography>
  );
}

export default function OrderDetailModal({ open, onClose, order, onOrderUpdated }) {
  const orderId = order?._id;
  const [shippingAnchorEl, setShippingAnchorEl] = useState(null);
  const [messageAnchorEl, setMessageAnchorEl] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
    mutationFn: async ({ kind, channel }) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      const endpoint =
        kind === "payment-reminder" ? "send-payment-reminder" : "send-order-placed";
      return await ApiService.call(`/api/admin/orders/${orderId}/${endpoint}`, "post", {
        channel,
      });
    },
    onSuccess: (_, payload) => {
      const kindLabel = payload.kind === "payment-reminder" ? "Payment reminder" : "Order placed";
      const channelLabel = payload.channel === "email" ? "email" : "WhatsApp";
      alert(`${kindLabel} ${channelLabel} sent successfully.`);
    },
    onError: (error) => {
      alert(error?.response?.data?.msg || error?.message || "Failed to send message");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      if (!orderId) {
        throw new Error("Order not found");
      }
      return await ApiService.call(`/api/admin/orders/${orderId}/status`, "put", { status });
    },
    onSuccess: (data) => {
      const updatedOrder = data?.order;
      if (updatedOrder && onOrderUpdated) {
        onOrderUpdated(updatedOrder);
      }
      alert(`Order status updated to ${updatedOrder?.status || "new status"}.`);
      setStatusAnchorEl(null);
    },
    onError: (error) => {
      alert(error?.response?.data?.msg || error?.message || "Failed to update status");
    },
  });

  if (!order) return null;

  const formattedDate = order.createdAt
    ? format(new Date(order.createdAt), "MMM dd, yyyy • h:mm a")
    : "N/A";
  const openMessageMenu = (event) => setMessageAnchorEl(event.currentTarget);
  const closeMessageMenu = () => setMessageAnchorEl(null);
  const openStatusMenu = (event) => setStatusAnchorEl(event.currentTarget);
  const closeStatusMenu = () => setStatusAnchorEl(null);
  const isCodOrder = order?.paymentMethod === "cod";
  const gstAmount = Number(order?.tax || 0) || getIncludedGst(order?.subTotal || order?.amount || 0);

  const handleSendMessage = (payload) => {
    closeMessageMenu();
    sendMessageMutation.mutate(payload);
  };

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
                                <Box sx={{ mt: 0.5, display: "grid", gap: 0.5 }}>
                                  {Object.entries(item.customization).map(([field, value]) =>
                                    renderCustomizationValue(
                                      item,
                                      field,
                                      value,
                                      true,
                                      setPreviewImage
                                    )
                                  )}
                                </Box>
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
                  <Typography variant="body2">{order.paymentMethod || order.pg || "N/A"}</Typography>
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
                    Subtotal
                  </Typography>
                  <Typography variant="body2">₹{order.subTotal || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Included GST (18%)
                  </Typography>
                  <Typography variant="body2">₹{gstAmount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Delivery
                  </Typography>
                  <Typography variant="body2">
                    {Number(order.deliveryCharge || 0) === 0 ? "FREE" : `₹${order.deliveryCharge}`}
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
                    Payment Status
                  </Typography>
                  <Typography variant="body2">{order.paymentStatus || "N/A"}</Typography>
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

      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="h6">
            {previewImage?.label || "Customization Image"}
          </Typography>
          <IconButton onClick={() => setPreviewImage(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewImage?.path && (
            <EcomImage
              path={previewImage.path}
              alt={previewImage.label || "Customization Image"}
              style={{
                width: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<CampaignIcon />}
          onClick={openMessageMenu}
          disabled={sendMessageMutation.isPending}
        >
          Send Message
        </Button>
        <Menu
          anchorEl={messageAnchorEl}
          open={Boolean(messageAnchorEl)}
          onClose={closeMessageMenu}
        >
          <MenuItem onClick={() => handleSendMessage({ kind: "order-placed", channel: "whatsapp" })}>
            <ListItemIcon>
              <WhatsAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemIcon>
              <ShoppingBagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Order Placed (WhatsApp)</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSendMessage({ kind: "order-placed", channel: "email" })}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemIcon>
              <ShoppingBagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Order Placed (Email)</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSendMessage({ kind: "payment-reminder", channel: "whatsapp" })}>
            <ListItemIcon>
              <WhatsAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemIcon>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Payment Reminder (WhatsApp)</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSendMessage({ kind: "payment-reminder", channel: "email" })}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemIcon>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Payment Reminder (Email)</ListItemText>
          </MenuItem>
        </Menu>
        
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

        {isCodOrder && order.status === "finalized" && (
          <Button
            variant="contained"
            color="success"
            onClick={() => updateStatusMutation.mutate("confirmed")}
            disabled={updateStatusMutation.isPending}
          >
            Confirm COD
          </Button>
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

        <Button
          variant="outlined"
          color="primary"
          onClick={openStatusMenu}
          disabled={updateStatusMutation.isPending}
        >
          Update Status
        </Button>
        <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={closeStatusMenu}
        >
          {orderStatusOptions.map((statusOption) => (
            <MenuItem
              key={statusOption.value}
              sx={{
                display:
                  statusOption.value === "confirmed" && !isCodOrder ? "none" : undefined,
              }}
              disabled={statusOption.value === order.status || updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate(statusOption.value)}
            >
              <ListItemText>{statusOption.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
        <Button variant="contained" color="primary">
          Print Invoice
        </Button>
      </Box>
    </Dialog>
  );
}
