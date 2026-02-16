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
    if (product && !order) {
      actionCreateOrder.mutate();
    } 
  }, []);

  const needToSelectVariant =
    Object.keys(product?.variants || {}).length > 0 && !order?.info?.variant;

  const getStepLabel = (stepNumber) => {
    if (stepNumber === 1) {
      return needToSelectVariant ? "Select Variant" : "Customize";
    } else if (stepNumber === 2) {
      return "Delivery Address";
    } else if (stepNumber === 3) {
      return "Review & Pay";
    }
    return "";
  };

  const totalSteps = 3;

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

  return (
    <Container maxWidth="md">
      {product && order && (
        <>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Stepper activeStep={step - 1} alternativeLabel>
              {[1, 2, 3].map((stepNum) => (
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
              switch (step) {
                case 1:
                  return needToSelectVariant ? (
                    <SelectVariant />
                  ) : (
                    <AddCustomization />
                  );
                case 2:
                  return <GetAddress />;
                case 3:
                  return <OrderReviewAndPay />;
                default:
                  return <div>Something is wrong</div>;
              }
            })()}
          </Paper>
        </>
      )}
      <LoadingErrorRQ q={actionCreateOrder} />
    </Container>
  );
}
