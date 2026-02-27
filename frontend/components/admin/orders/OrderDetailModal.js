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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";

const statusColors = {
  paid: "success",
  pending: "warning",
  cancelled: "error",
  delivered: "info",
  processing: "secondary",
};

export default function OrderDetailModal({ open, onClose, order }) {
  if (!order) return null;

  const formattedDate = order.createdAt
    ? format(new Date(order.createdAt), "MMM dd, yyyy • h:mm a")
    : "N/A";

  const sendMessageMutation = useMutation({
    mutationFn: async (channel) => {
      return await ApiService.call(`/api/admin/orders/${order._id}/send-order-placed`, "post", {
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

      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
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
