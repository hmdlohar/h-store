import { useOrderStore } from "@/store/orderStore";
import GetAddress from "./GetAddress";
import AddCustomization from "./customizationInputs/AddCustomization";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import SelectVariant from "./SelectVariant";
import OrderReviewAndPay from "./OrderReviewAndPay";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";
import { useRouter } from "next/router";

export default function OrderPage() {
  const { step, setStep, product, order, setOrder } = useOrderStore();
  const router = useRouter();
  console.log({ order, product });

  const actionCreateOrder = useMutation({
    mutationFn: async () => {
      const response = await ApiService.call("/api/order", "post", {
        items: [
          {
            productId: product._id,
            productName: product.name,
            quantity: 1,
            price: product.price,
            amount: product.price,
          },
        ],
      });
      setOrder(response);
      return response;
    },
  });

  useEffect(() => {
    // If no product in state (page refreshed), redirect back or to home
    if (!product && typeof window !== "undefined") {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
      return;
    }
    
    if (product && !order) {
      actionCreateOrder.mutate();
    } 
  }, []);

  const hasVariants = Object.keys(product?.variants || {}).length > 0;
  const needToSelectVariant = hasVariants && !order?.info?.variant;

  const getStepLabel = (stepNumber) => {
    if (hasVariants) {
      if (stepNumber === 1) return "Delivery Address";
      if (stepNumber === 2) return "Select Variant";
      if (stepNumber === 3) return "Customize";
      if (stepNumber === 4) return "Review & Pay";
    } else {
      if (stepNumber === 1) return "Delivery Address";
      if (stepNumber === 2) return "Customize";
      if (stepNumber === 3) return "Review & Pay";
    }
    return "";
  };

  const totalSteps = hasVariants ? 4 : 3;

  // Calculate current price
  const getCurrentPrice = () => {
    if (!order || !product) return 0;
    console.log("order", order);

    // Check if variant is selected
    if (order.info?.variant && product.variants?.[order.info.variant]) {
      return product.variants[order.info.variant].price;
    }

    // Default to base product price
    return product.price || 0;
  };

  const currentPrice = getCurrentPrice();

  // Show loading or redirect if no product
  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Redirecting...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {product && order && (
        <>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Stepper activeStep={step - 1} alternativeLabel>
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
                <Step key={stepNum}>
                  <StepLabel>{getStepLabel(stepNum)}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Price Summary Card */}
          <Card
            elevation={1}
            sx={{ mb: 2, border: "1px solid", borderColor: "primary.main" }}
          >
            <CardContent
              sx={{
                py: 1,
                "&:last-child": { pb: 1 },
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Order Total
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="primary.main"
                  >
                    ₹{currentPrice.toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" color="text.secondary">
                    {product.name}
                  </Typography>
                  {order.info?.variant && (
                    <Typography variant="caption" color="text.secondary">
                      Variant: {order.info.variant}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Paper elevation={0} sx={{ p: 0 }}>
            {(() => {
              if (hasVariants) {
                switch (step) {
                  case 1:
                    return <GetAddress />;
                  case 2:
                    return <SelectVariant />;
                  case 3:
                    return <AddCustomization />;
                  case 4:
                    return <OrderReviewAndPay />;
                  default:
                    return <div>Something is wrong</div>;
                }
              } else {
                switch (step) {
                  case 1:
                    return <GetAddress />;
                  case 2:
                    return <AddCustomization />;
                  case 3:
                    return <OrderReviewAndPay />;
                  default:
                    return <div>Something is wrong</div>;
                }
              }
            })()}
          </Paper>
        </>
      )}
      <LoadingErrorRQ q={actionCreateOrder} />
    </Container>
  );
}
