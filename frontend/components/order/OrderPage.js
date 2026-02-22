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
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";

export default function OrderPage() {
  const { step, setStep, product, order, setOrder, hasVariants } = useOrderStore();
  const router = useRouter();

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
    // If order and product are already loaded (from checkout page), don't redirect
    if (order && product) {
      return;
    }
    
    // If no product in state (page refreshed without going through checkout), redirect back or to home
    if (!product && typeof window !== "undefined") {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
      return;
    }
    
    // If product exists but no order, create one
    if (product && !order) {
      actionCreateOrder.mutate();
    } 
  }, []);

  // If order is finalized, go to final step
  useEffect(() => {
    if (order?.status === "finalized") {
      const finalStep = hasVariants ? 4 : 3;
      setStep(finalStep);
    }
  }, [order?.status, hasVariants, setStep]);

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
