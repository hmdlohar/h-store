import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Confetti from "react-confetti";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useCommonStore } from "@/store/commonStore";
import { fbPixel } from "@/services/FacebookPixelService";

export default function OrderSuccessPage({ orderId }) {
  const order = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => {
      return ApiService.call(`/api/order/${orderId}`, "get");
    },
  });

  const router = useRouter();
  const { user } = useCommonStore();
  const [copied, setCopied] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  // Track Purchase event when order is loaded
  useEffect(() => {
    if (order.data && !order.isLoading) {
      const orderData = order.data;
      const items = orderData.items || [];
      
      fbPixel.purchase({
        content_ids: items.map(item => item.productId),
        content_name: items.map(item => item.productName).join(", ") || "Order",
        content_type: "product",
        value: orderData.finalAmount || orderData.amount || 0,
        currency: "INR",
        num_items: items.length,
        order_id: orderData._id,
      });
    }
  }, [order.data, order.isLoading]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order?.data?.orderNumber?.toString() || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Box sx={{ textAlign: "center", py: 4 }}>
        {!order?.isLoading &&
          !order?.error &&
          order?.data &&
          windowSize.width > 0 && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
            />
          )}

        {order?.isLoading ? (
          <CircularProgress />
        ) : order?.error ? (
          <Typography color="error">
            Error loading order details. Please try again.
          </Typography>
        ) : order?.data ? (
          <>
            <CheckCircleIcon
              sx={{ fontSize: 80, color: "success.main", mb: 2 }}
            />

            <Typography variant="h5" gutterBottom fontWeight={600}>
              Thank You! Your Order is Placed
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{ mb: 3 }}
            >
              We&apos;ll call you shortly to confirm your order details.
            </Typography>

            <Box
              sx={{
                border: "2px dashed",
                borderColor: "primary.main",
                borderRadius: 2,
                p: 3,
                mb: 3,
                display: "inline-block",
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Order Number
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  #{order?.data?.orderNumber}
                </Typography>
                <Button
                  size="small"
                  onClick={handleCopyOrderNumber}
                  startIcon={<ContentCopyIcon />}
                  sx={{ minWidth: "auto" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              Save this order number for tracking your order
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Order Amount:{" "}
              <strong>₹{order?.data?.amount?.toLocaleString("en-IN")}</strong>
            </Typography>

            {user && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push(`/order/${orderId}`)}
                sx={{ mt: 2, mr: 1 }}
              >
                View Order Details
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/")}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </>
        ) : null}
      </Box>
    </div>
  );
}
