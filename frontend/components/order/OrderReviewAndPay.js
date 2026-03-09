import React from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/services/ApiService";
import { useOrderStore } from "@/store/orderStore";
import { Box, Typography, Divider, Grid, Chip, Paper, Button, Stack } from "@mui/material";
import EcomImage from "@/common/EcomImage";
import { launchCashfreePayment } from "@/utils/cashfree";
import { useMutation } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { CONTACT_PHONE } from "@/constants";
import { insightService } from "@/services/InsightService";
import { fbPixel } from "@/services/FacebookPixelService";
import OrderStepWrapper from "./OrderStepWrapper";
import { useEffect } from "react";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

function prettyPrice(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function getIncludedGst(amount) {
  const numericAmount = Number(amount || 0);
  if (!numericAmount) return 0;
  return Number((numericAmount - numericAmount / 1.18).toFixed(2));
}

export default function OrderReviewAndPay() {
  const { order, product, resetOrder, setStep, step, hasVariants, setOrder } = useOrderStore();
  const [paymentMethod, setPaymentMethod] = React.useState(order?.paymentMethod || "online");

  const actionFinalizeOrder = useMutation({
    mutationFn: async (selectedPaymentMethod) => {
      const res = await ApiService.call("/api/order/finalize-order", "post", {
        orderId: order._id,
        paymentMethod: selectedPaymentMethod,
      });
      setOrder(res);
      return res;
    },
  });

  useEffect(() => {
    if (order) {
      const resolvedPaymentMethod = order.paymentMethod || paymentMethod;
      const canFinalize = ["pending", "finalized"].includes(order.status);
      if (canFinalize && (order.status !== "finalized" || order.paymentMethod !== resolvedPaymentMethod)) {
        actionFinalizeOrder.mutate(resolvedPaymentMethod);
      }
    }
  }, [order?._id, paymentMethod]);

  useEffect(() => {
    if (order?.paymentMethod && order.paymentMethod !== paymentMethod) {
      setPaymentMethod(order.paymentMethod);
    }
  }, [order?.paymentMethod]);

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

  const actionPlaceCodOrder = useMutation({
    mutationFn: async () => {
      const res = await ApiService.call("/api/order/place-cod-order", "post", {
        orderId: order._id,
      });
      setOrder(res);
      router.push(`/order-success/${order._id}`);
      setTimeout(() => {
        resetOrder();
      }, 1000);
      return res;
    },
  });

  const item = order.items?.[0] || {};
  const price = item.price || product.price || 0;
  const subTotal = Number(order.subTotal || item.amount || price || 0);
  const gst = Number(order.tax || 0) || getIncludedGst(subTotal);
  const deliveryCharge = Number(
    paymentMethod === "cod"
      ? 80
      : order.paymentMethod === "cod"
      ? order.deliveryCharge || 80
      : 0,
  );
  const amount = subTotal + deliveryCharge;

  const customization = item.customization || {};
  const customizationsDef = product.customizations || [];

  const address = order.deliveryAddress || {};

  const [paying, setPaying] = React.useState(false);
  const [payError, setPayError] = React.useState("");
  const router = useRouter();

  async function handlePay() {
    if (paymentMethod === "cod") {
      insightService.trackEvent("cod_place_order", {
        orderId: order._id,
        amount,
      });
      setPayError("");
      setPaying(true);
      try {
        await actionPlaceCodOrder.mutateAsync();
      } catch (ex) {
        setPayError(ex?.message || "Could not place COD order. Please try again.");
      } finally {
        setPaying(false);
      }
      return;
    }

    insightService.trackEvent("pay_now", {
      orderId: order._id,
      amount,
    });
    
    fbPixel.initiateCheckout({
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: amount,
      currency: "INR",
      num_items: 1,
    });
    
    setPayError("");
    setPaying(true);
    try {
      const res = await ApiService.call(
        "/api/order/create-cashfree-order",
        "post",
        { orderId: order._id }
      );
      const data = res;
      const paymentResult = await launchCashfreePayment(
        data.payment_session_id
      );
      
      insightService.trackEvent("payment_result", {
        orderId: order._id,
        paymentResult,
      });

      const result = await actionVerifyCashfreeOrder.mutateAsync();
    } catch (ex) {
      insightService.trackEvent("payment_failed", {
        orderId: order._id,
        error: ex?.message,
      });
      setPayError(ex?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  const handleBack = () => setStep(step - 1);

  if (!order || !product) return null;

  return (
    <OrderStepWrapper
      title="Review & Pay"
      onBack={handleBack}
      onContinue={handlePay}
      continueDisabled={paying || actionVerifyCashfreeOrder.isPending || actionPlaceCodOrder.isPending}
      continueLoading={paying}
      continueText={paymentMethod === "cod" ? "Place COD Order" : "Pay Now"}
    >
      <Box maxWidth={560} mx="auto">
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Amount to pay
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {prettyPrice(amount)}
              </Typography>
            </Box>
            <Chip label={`Order #${order.orderNumber || order._id}`} color="primary" variant="outlined" />
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Payment Method
          </Typography>
          <Typography variant="body2" color="success.main" sx={{ mb: 1.25, fontWeight: 600 }}>
            Free delivery on online payment
          </Typography>
          <Stack spacing={1.25}>
            <Box
              onClick={() => setPaymentMethod("online")}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: paymentMethod === "online" ? "primary.main" : "divider",
                bgcolor: paymentMethod === "online" ? "rgba(25, 118, 210, 0.06)" : "background.paper",
                cursor: "pointer",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                {paymentMethod === "online" ? (
                  <RadioButtonCheckedIcon color="primary" sx={{ mt: 0.1 }} />
                ) : (
                  <RadioButtonUncheckedIcon color="action" sx={{ mt: 0.1 }} />
                )}
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    Pay with UPI, Cards, Net Banking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Free delivery. Pay now and confirm your order instantly.
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box
              onClick={() => setPaymentMethod("cod")}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: paymentMethod === "cod" ? "primary.main" : "divider",
                bgcolor: paymentMethod === "cod" ? "rgba(25, 118, 210, 0.06)" : "background.paper",
                cursor: "pointer",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                {paymentMethod === "cod" ? (
                  <RadioButtonCheckedIcon color="primary" sx={{ mt: 0.1 }} />
                ) : (
                  <RadioButtonUncheckedIcon color="action" sx={{ mt: 0.1 }} />
                )}
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    Cash on Delivery
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Extra delivery charge of {prettyPrice(80)}. We will call you to confirm before processing the order.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
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
              <Typography variant="subtitle1" fontWeight={700}>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Product total: {prettyPrice(subTotal)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="subtitle1" fontWeight={700} mb={1.25}>
            Amount Breakdown
          </Typography>
          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2">{prettyPrice(subTotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Included GST (18%)
              </Typography>
              <Typography variant="body2">{prettyPrice(gst)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Delivery charges
              </Typography>
              <Typography
                variant="body2"
                color={paymentMethod === "online" ? "success.main" : "text.primary"}
                fontWeight={paymentMethod === "online" ? 700 : 400}
              >
                {paymentMethod === "online" ? "FREE" : prettyPrice(deliveryCharge)}
              </Typography>
            </Stack>
            <Divider sx={{ my: 0.5 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="subtitle2" fontWeight={700}>
                {prettyPrice(amount)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              Customization
            </Typography>
            <Button size="small" onClick={() => setStep(hasVariants ? 2 : 1)}>
              Edit
            </Button>
          </Stack>
          {customizationsDef.length === 0 && (
            <Typography color="text.secondary">No customization</Typography>
          )}
          <Stack spacing={1}>
            {customizationsDef.map((c) => {
              const val = customization[c.field];
              if (!val) return null;
              if (c.fieldType === "image") {
                return (
                  <Box key={c.field}>
                    <Typography variant="body2" fontWeight={600}>
                      {c.label}
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
              if (c.fieldType === "color") {
                return (
                  <Box key={c.field}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      {c.label}
                    </Typography>
                    <Chip
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              background: val,
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "1px solid #ddd",
                            }}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {c.options?.find((o) => o.code === val)?.name || val}
                          </Typography>
                        </Box>
                      }
                      variant="outlined"
                    />
                  </Box>
                );
              }
              return (
                <Box key={c.field}>
                  <Typography variant="body2" fontWeight={600}>
                    {c.label}
                  </Typography>
                  <Typography variant="body2">{val}</Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              Delivery Address
            </Typography>
            <Button size="small" onClick={() => setStep(hasVariants ? 3 : 2)}>
              Edit
            </Button>
          </Stack>
          <Typography variant="body2">{address.name}</Typography>
          <Typography variant="body2">{address.mobile}</Typography>
          {address.email && <Typography variant="body2">{address.email}</Typography>}
          <Typography variant="body2">
            {address.home}, {address.area}
          </Typography>
          <Typography variant="body2">
            {address.city}, {address.state} - {address.pincode}
          </Typography>
          <Typography variant="body2">{address.country || "India"}</Typography>
        </Paper>

        <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
          <Typography variant="body2">
            {paymentMethod === "cod"
              ? "Place your COD order now. We will call you shortly to confirm it before processing."
              : "Pay now to confirm your order. You will receive a WhatsApp message with order details once payment is successful."}
          </Typography>
          <Typography variant="body2">
            Need help? Contact us on{" "}
            <Typography
              component="a"
              href={`https://wa.me/${CONTACT_PHONE?.replace(/\s/g, "")?.replace(/\+/g, "")}`}
              sx={{ color: "inherit", textDecoration: "underline" }}
            >
              {CONTACT_PHONE}
            </Typography>
          </Typography>
        </Box>

        {payError && (
          <Typography color="error" mt={1} variant="caption" display="block" textAlign="center">
            {payError}
          </Typography>
        )}

        <LoadingErrorRQ query={actionVerifyCashfreeOrder} />
        <LoadingErrorRQ query={actionPlaceCodOrder} />
      </Box>
    </OrderStepWrapper>
  );
}
