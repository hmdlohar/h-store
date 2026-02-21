import EcomHead from "@/common/EcomHead";
import OrderPage from "@/components/order/OrderPage";
import MainLayout from "@/layout/MainLayout";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import { useOrderStore } from "@/store/orderStore";
import { Container, Typography, Box, CircularProgress, Button } from "@mui/material";
import { useRouter } from "next/router";

export default function CheckoutPage({ orderId: initialOrderId }) {
  const store = useOrderStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const mounted = useRef(false);
  
  const { data: orderData, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ["order", initialOrderId],
    queryFn: () => ApiService.call(`/api/order/${initialOrderId}`, "get"),
    enabled: !!initialOrderId,
    staleTime: 0,
  });

  const productId = orderData?.items?.[0]?.productId;
  
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => ApiService.call("/api/products", "get"),
    enabled: !!orderData,
    staleTime: 1000 * 60 * 5,
  });

  const productData = productsData?.find(p => p._id === productId);

  useEffect(() => {
    if (orderData) {
      store.setOrder(orderData);
    }
  }, [orderData]);

  useEffect(() => {
    if (productData) {
      store.setProduct(productData);
    }
  }, [productData]);

  useEffect(() => {
    if (orderData && productData && !mounted.current) {
      mounted.current = true;
      store.setStep(1);
      setIsReady(true);
    }
  }, [orderData, productData]);

  const isLoading = orderLoading || !productsData;
  
  if (isLoading || !isReady) {
    return (
      <>
        <EcomHead title="Loading Order..." />
        <MainLayout>
          <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress />
            <Typography mt={2}>Loading order...</Typography>
            <Typography mt={1} variant="caption" color="text.secondary">
              {orderLoading ? "Loading order..." : "Loading products..."}
            </Typography>
          </Container>
        </MainLayout>
      </>
    );
  }

  if (orderError || !orderData) {
    return (
      <>
        <EcomHead title="Order Not Found" />
        <MainLayout>
          <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6" color="error">
              Order not found
            </Typography>
            <Typography mt={2}>
              This order may have been deleted or doesn't exist.
            </Typography>
            <Button mt={3} variant="contained" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </Container>
        </MainLayout>
      </>
    );
  }

  if (!productData) {
    return (
      <>
        <EcomHead title="Product Not Found" />
        <MainLayout>
          <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6" color="error">
              Product not found
            </Typography>
            <Typography mt={2}>
              The product for this order no longer exists.
            </Typography>
            <Button mt={3} variant="contained" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </Container>
        </MainLayout>
      </>
    );
  }

  return (
    <>
      <EcomHead title="Order" />
      <MainLayout>
        <OrderPage />
      </MainLayout>
    </>
  );
}

export async function getServerSideProps(context) {
  const { orderId } = context.params;
  return {
    props: {
      orderId,
    },
  };
}
