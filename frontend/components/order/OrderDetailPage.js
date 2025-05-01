import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Box, Typography, Divider, Grid, Chip } from "@mui/material";
import EcomImage from "@/common/EcomImage";
import { prettyPrice } from "hyper-utils";

export default function OrderDetailPage({ orderId }) {
  const order = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: async () => {
      const res = await ApiService.call(`/api/order/${orderId}`, "get");
      return res;
    },
  });

  const orderData = order;

  if (!orderData) {
    return <LoadingErrorRQ query={order} />;
  }

  return (
    <Box maxWidth={480} mx="auto" mt={4} p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Order Details</Typography>
        <Chip
          label={orderData.status.toUpperCase()}
          color={orderData.status === "completed" ? "success" : "warning"}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Order #{orderData.orderNumber}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Order Items */}
      {orderData.items?.map((item, index) => (
        <Box key={index} mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <EcomImage
                path={item.productImage}
                thumbnail
                style={{ width: "100%", borderRadius: 8 }}
                alt={item.productName}
              />
            </Grid>
            <Grid item xs={8}>
              <Typography variant="subtitle1" fontWeight={600}>
                {item.productName}
              </Typography>
              {item.variant && (
                <Typography variant="body2" color="text.secondary">
                  Variant: {item.variant}
                </Typography>
              )}
              <Box mt={1}>
                <Typography variant="body2">
                  Price: {prettyPrice(item.price)}
                </Typography>
                <Typography variant="body2">
                  Quantity: {item.quantity}
                </Typography>
                {item.tax && (
                  <Typography variant="body2">
                    Tax: {prettyPrice(item.tax)}
                  </Typography>
                )}
                <Typography variant="subtitle2" fontWeight={700}>
                  Total: {prettyPrice(item.amount)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Customization */}
          {item.customization && Object.keys(item.customization).length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" fontWeight={500} mb={1}>
                Customization
              </Typography>
              {Object.entries(item.customization).map(([key, value]) => (
                <Box key={key} mb={1}>
                  <Typography variant="body2" fontWeight={500}>
                    {key}:
                  </Typography>
                  {typeof value === "string" && value.startsWith("http") ? (
                    <EcomImage
                      path={value}
                      small
                      style={{ maxWidth: 100, borderRadius: 4 }}
                      alt={key}
                    />
                  ) : (
                    <Typography variant="body2">{value}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {index < orderData.items.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Price Summary */}
      <Box mb={3}>
        <Typography variant="subtitle1" mb={1}>
          Price Details
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Subtotal</Typography>
          <Typography variant="body2">
            {prettyPrice(orderData.subTotal)}
          </Typography>
        </Box>
        {orderData.tax && (
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Tax</Typography>
            <Typography variant="body2">
              {prettyPrice(orderData.tax)}
            </Typography>
          </Box>
        )}
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>
            Total Amount
          </Typography>
          <Typography variant="subtitle2" fontWeight={700}>
            {prettyPrice(orderData.amount)}
          </Typography>
        </Box>
      </Box>

      {/* Delivery Address */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" mb={1}>
        Delivery Address
      </Typography>
      <Box mb={2}>
        <Typography variant="body2">
          {orderData.deliveryAddress?.name}
        </Typography>
        <Typography variant="body2">
          {orderData.deliveryAddress?.mobile}
        </Typography>
        <Typography variant="body2">
          {orderData.deliveryAddress?.home}, {orderData.deliveryAddress?.area}
        </Typography>
        <Typography variant="body2">
          {orderData.deliveryAddress?.city}, {orderData.deliveryAddress?.state}{" "}
          - {orderData.deliveryAddress?.pincode}
        </Typography>
        <Typography variant="body2">
          {orderData.deliveryAddress?.country || "India"}
        </Typography>
      </Box>

      {/* Order Info */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" mb={1}>
        Order Information
      </Typography>
      <Box mb={2}>
        <Typography variant="body2">
          Order Date: {new Date(orderData.createdAt).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">Payment Method: {orderData.pg}</Typography>
        {orderData.pgOrderID && (
          <Typography variant="body2">
            Payment ID: {orderData.pgOrderID}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
