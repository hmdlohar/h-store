import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Confetti from "react-confetti";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function OrderSuccessPage({ orderId }) {
  const order = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => {
      return ApiService.call(`/api/order/${orderId}`, "get");
    },
  });

  const router = useRouter();

  return (
    <div>
      <Box sx={{ textAlign: "center", py: 4 }}>
        {!order?.isLoading && !order?.error && order?.data && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
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
              sx={{ fontSize: 64, color: "success.main", mb: 2 }}
            />

            <Typography variant="h4" gutterBottom>
              Thank you for your order!
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              Your order has been successfully placed. We'll send you an SMS
              confirmation shortly.
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              Order Number: #{order?.data?.orderNumber}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/order/${orderId}`)}
              sx={{ mt: 2 }}
            >
              View Order Details
            </Button>
          </>
        ) : null}
      </Box>
    </div>
  );
}
