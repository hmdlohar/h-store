import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { ApiService } from "@/services/ApiService";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import EcomHead from "@/common/EcomHead";

const MainLayout = dynamic(() => import("@/layout/MainLayout"), { ssr: false });

export default function PaymentReturn() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !router.query.order_id) return;

    const order_id = router.query.order_id;
    const txStatus = router.query.txStatus;

    async function verifyPayment() {
      try {
        await ApiService.call("/api/order/verify-cashfree-order", "post", {
          orderId: order_id,
        });
        setStatus("success");
        setTimeout(() => {
          router.push(`/order-success/${order_id}`);
        }, 1500);
      } catch (ex) {
        console.error("Payment verification failed:", ex);
        setStatus("failed");
      }
    }

    if (txStatus === "CANCELLED") {
      setStatus("cancelled");
      return;
    }

    verifyPayment();
  }, [mounted, router.query.order_id, router.query.txStatus, router]);

  return (
    <>
      <EcomHead title="Processing Payment" />
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            gap: 2,
            textAlign: "center",
            py: 4,
          }}
        >
          {status === "loading" && (
            <>
              <CircularProgress size={48} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Verifying payment...
              </Typography>
              <Typography color="text.secondary">
                Please wait while we confirm your payment
              </Typography>
            </>
          )}

          {status === "success" && (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "success.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h4" color="success.main">
                  ✓
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={600} color="success.main">
                Payment Successful!
              </Typography>
              <Typography color="text.secondary">
                Redirecting to order details...
              </Typography>
            </>
          )}

          {status === "failed" && (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "error.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h4" color="error.main">
                  ✕
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={600} color="error.main">
                Payment Failed
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
                There was an issue verifying your payment. Please contact support or try again.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/")}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/order/${router.query.order_id}`)}
                >
                  View Order
                </Button>
              </Box>
            </>
          )}

          {status === "cancelled" && (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "warning.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h4" color="warning.main">
                  !
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={600} color="warning.main">
                Payment Cancelled
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
                You cancelled the payment. Please try again when ready.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push("/")}
                sx={{ mt: 2 }}
              >
                Continue Shopping
              </Button>
            </>
          )}
        </Box>
      </MainLayout>
    </>
  );
}
