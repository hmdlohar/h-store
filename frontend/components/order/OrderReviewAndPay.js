import React from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/services/ApiService";
import { useOrderStore } from "@/store/orderStore";
import { Box, Typography, Divider, Grid, Chip } from "@mui/material";
import EcomImage from "@/common/EcomImage";
import { launchCashfreePayment } from "@/utils/cashfree";
import { useMutation } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { CONTACT_PHONE } from "@/constants";
import { insightService } from "@/services/InsightService";
import { fbPixel } from "@/services/FacebookPixelService";
import OrderStepWrapper from "./OrderStepWrapper";
import { useEffect } from "react";

function prettyPrice(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function OrderReviewAndPay() {
  const { order, product, resetOrder, setStep, step, hasVariants, setOrder } = useOrderStore();

  const actionFinalizeOrder = useMutation({
    mutationFn: async () => {
      const res = await ApiService.call("/api/order/finalize-order", "post", {
        orderId: order._id,
      });
      setOrder(res);
      return res;
    },
  });

  useEffect(() => {
    if (order && order.status !== "finalized") {
      actionFinalizeOrder.mutate();
    }
  }, []);

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

  const item = order.items?.[0] || {};
  const price = item.price || product.price || 0;
  const tax = item.tax || 0;
  const amount = item.amount || price + tax;

  const customization = item.customization || {};
  const customizationsDef = product.customizations || [];

  const address = order.deliveryAddress || {};

  const [paying, setPaying] = React.useState(false);
  const [payError, setPayError] = React.useState("");
  const router = useRouter();

  async function handlePay() {
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
      title="Order Review"
      onBack={handleBack}
      onContinue={handlePay}
      continueDisabled={paying || actionVerifyCashfreeOrder.isPending}
      continueLoading={paying}
      continueText="Pay Now"
    >
      <Box maxWidth={480} mx="auto">
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

        <Typography variant="subtitle1" mb={1} fontWeight={600}>
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
                <React.Fragment key={c.field}>
                  <Typography variant="body2" fontWeight={500}>
                    {c.label}:
                  </Typography>
                  <Chip
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
                </React.Fragment>
              );
            }
            if ((c.fieldType === "text" || c.fieldType === "text_alphabet") && val) {
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

        <Typography variant="subtitle1" mb={1} fontWeight={600}>
          Delivery Address
        </Typography>
        <Box mb={2}>
          <Typography variant="body2">{address.name}</Typography>
          <Typography variant="body2">{address.mobile}</Typography>
          {address.email && (
            <Typography variant="body2">{address.email}</Typography>
          )}
          <Typography variant="body2">
            {address.home}, {address.area}
          </Typography>
          <Typography variant="body2">
            {address.city}, {address.state} - {address.pincode}
          </Typography>
          <Typography variant="body2">{address.country || "India"}</Typography>
        </Box>

        <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
          <Typography variant="body2">
            Pay now to confirm your order. You will receive an Whatsapp message with
            order details once payment is successful.
          </Typography>
          <Typography variant="body2">
            In case of any issues, please contact us on{" "}
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
      </Box>
    </OrderStepWrapper>
  );
}
