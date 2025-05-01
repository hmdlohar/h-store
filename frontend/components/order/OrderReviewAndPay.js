import React from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/services/ApiService";
import { useOrderStore } from "@/store/orderStore";
import { Box, Typography, Divider, Button, Grid, Chip } from "@mui/material";
import EcomImage from "@/common/EcomImage";
import { launchCashfreePayment } from "@/utils/cashfree";
import { useMutation } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";

function prettyPrice(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function OrderReviewAndPay() {
  const { order, product, resetOrder } = useOrderStore();

  const actionVerifyCashfreeOrder = useMutation({
    mutationFn: async () => {
      const res = await ApiService.call(
        "/api/order/verify-cashfree-order",
        "post",
        { orderId: order._id }
      );
      router.push(`/order-success/${order._id}`);
      setTimeout(() => {
        resetOrder();
      }, 1000);
      return res;
    },
  });

  // Get price, tax, total
  const item = order.items?.[0] || {};
  const price = item.price || product.price || 0;
  const tax = item.tax || 0;
  const amount = item.amount || price + tax;

  // Customization
  const customization = item.customization || {};
  const customizationsDef = product.customizations || [];

  // Delivery address
  const address = order.deliveryAddress || {};

  // Payment state
  const [paying, setPaying] = React.useState(false);
  const [payError, setPayError] = React.useState("");
  const router = useRouter();
  // Payment handler
  async function handlePay() {
    setPayError("");
    setPaying(true);
    try {
      // Call backend to create cashfree order
      const res = await ApiService.call(
        "/api/order/create-cashfree-order",
        "post",
        { orderId: order._id }
      );
      const data = res;
      console.log(data, "data");
      const paymentResult = await launchCashfreePayment(
        data.payment_session_id
      );
      console.log(paymentResult, "paymentResult");

      const result = await actionVerifyCashfreeOrder.mutateAsync();
      console.log(result, "result");
    } catch (ex) {
      setPayError(ex?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  if (!order || !product) return null;

  return (
    <Box maxWidth={480} mx="auto" mt={4} p={2}>
      <Typography variant="h6" mb={2}>
        Order Review
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item size={4}>
          <EcomImage
            path={product.mainImage?.imagePath}
            thumbnail
            style={{ width: "100%", borderRadius: 8 }}
            alt={product.name}
          />
        </Grid>
        <Grid item size={8}>
          <Typography variant="subtitle1" fontWeight={600}>
            {product.name}
          </Typography>

          <Box mt={1}>
            <Typography variant="body2">Price: {prettyPrice(price)}</Typography>
            {tax > 0 && (
              <Typography variant="body2">Tax: {prettyPrice(tax)}</Typography>
            )}
            <Typography variant="subtitle1" fontWeight={700}>
              Total: {prettyPrice(amount)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" mb={1}>
        Customization
      </Typography>
      {customizationsDef.length === 0 && (
        <Typography color="text.secondary">No customization</Typography>
      )}
      <Box mb={2}>
        {customizationsDef.map((c) => {
          const val = customization[c.field];
          if (c.fieldType === "image" && val) {
            return (
              <Box key={c.field} mb={1}>
                <Typography variant="body2" fontWeight={500}>
                  {c.label}:
                </Typography>
                <EcomImage
                  path={val}
                  small
                  style={{ maxWidth: 100, borderRadius: 4 }}
                  alt={c.label}
                />
              </Box>
            );
          }
          if (c.fieldType === "color" && val) {
            return (
              <>
                <Typography variant="body2" fontWeight={500}>
                  {c.label}:
                </Typography>
                <Chip
                  key={c.field}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          background: val,
                          width: 24,
                          height: 24,
                          borderRadius: 100,
                        }}
                      ></div>
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        {c.options?.find((o) => o.code === val)?.name}
                      </Typography>
                    </Box>
                  }
                />
              </>
            );
          }
          if (c.fieldType === "text" && val) {
            return (
              <Box key={c.field} mb={1}>
                <Typography variant="body2" fontWeight={500}>
                  {c.label}:
                </Typography>
                <Typography variant="body2">{val}</Typography>
              </Box>
            );
          }
          return null;
        })}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" mb={1}>
        Delivery Address
      </Typography>
      <Box mb={2}>
        <Typography variant="body2">{address.name}</Typography>
        <Typography variant="body2">{address.mobile}</Typography>
        <Typography variant="body2">
          {address.home}, {address.area}
        </Typography>
        <Typography variant="body2">
          {address.city}, {address.state} - {address.pincode}
        </Typography>
        <Typography variant="body2">{address.country || "India"}</Typography>
      </Box>

      <Typography variant="body2" textAlign="center" mt={2}>
        Pay now to confirm your order. You will receive an SMS with order
        details once payment is successful.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={paying || actionVerifyCashfreeOrder.isPending}
        onClick={handlePay}
      >
        {paying ? "Processing..." : "Complete The order"}
      </Button>
      {payError && (
        <Typography color="error" mt={2} textAlign="center">
          {payError}
        </Typography>
      )}
      <LoadingErrorRQ query={actionVerifyCashfreeOrder} />
    </Box>
  );
}
