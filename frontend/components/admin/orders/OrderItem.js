import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Collapse,
  Button,
  Divider,
  Paper,
  Avatar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { format } from "date-fns";

// Status color mapping
const statusColors = {
  paid: "success",
  pending: "warning",
  cancelled: "error",
  delivered: "info",
  processing: "secondary",
};

export default function OrderItem({ order }) {
  const [expanded, setExpanded] = useState(false);

  // Format date
  const formattedDate = order.createdAt
    ? format(new Date(order.createdAt), "MMM dd, yyyy • h:mm a")
    : "N/A";

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
      }}
    >
      {/* Order Summary Row */}
      <Box
        sx={{
          p: 1,
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.02)" },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Grid container>
          <Grid item size={{ xs: 12, sm: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Order #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
          </Grid>

          <Grid item size={{ xs: 12, sm: 3 }}>
            <Typography variant="body2" noWrap>
              {order.deliveryAddress?.name || "N/A"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {order.deliveryAddress?.mobile || "N/A"}
            </Typography>
          </Grid>

          <Grid item size={{ xs: 12, sm: 2 }}>
            <Chip
              label={order.status}
              size="small"
              color={statusColors[order.status] || "default"}
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle2">₹{order.amount}</Typography>
            <Typography variant="caption" color="text.secondary">
              {order.pg}
            </Typography>
          </Grid>

          <Grid item size={{ xs: 12, sm: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {order.items?.length || 0} item(s)
            </Typography>
          </Grid>

          <Grid item size={{ xs: 12, sm: 1 }} textAlign="right">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Grid>
        </Grid>
      </Box>

      {/* Expanded Details */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2, bgcolor: "rgba(0, 0, 0, 0.01)" }}>
          {/* Order Items */}
          <Typography variant="subtitle1" gutterBottom>
            Order Items
          </Typography>

          {order.items &&
            order.items.map((item, index) => (
              <Box
                key={item._id || index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                }}
              >
                <Avatar
                  src={
                    item.product?.mainImage?.imagePath
                      ? `/uploads/${item.product.mainImage.imagePath}`
                      : "/placeholder.png"
                  }
                  variant="rounded"
                  sx={{ width: 60, height: 60, mr: 2 }}
                />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: {item.quantity} × ₹{item.price} = ₹{item.amount}
                  </Typography>

                  {/* Customizations */}
                  {item.customization &&
                    Object.keys(item.customization).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Customization:
                        </Typography>
                        {Object.entries(item.customization).map(
                          ([key, value]) => (
                            <Typography key={key} variant="body2">
                              {key}: <strong>{value}</strong>
                            </Typography>
                          )
                        )}
                      </Box>
                    )}
                </Box>
              </Box>
            ))}

          {/* Delivery Address */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Delivery Address
          </Typography>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
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

          {/* Payment Info */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Payment Information
          </Typography>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1">{order.pg}</Typography>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                  {order.pgOrderID}
                </Typography>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1">₹{order.amount}</Typography>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={order.status}
                  size="small"
                  color={statusColors[order.status] || "default"}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button variant="outlined" color="primary">
              Update Status
            </Button>
            <Button variant="contained" color="primary">
              Print Invoice
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
