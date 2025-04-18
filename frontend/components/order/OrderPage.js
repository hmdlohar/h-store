import { useOrderStore } from "@/store/orderStore";
import GetAddress from "./GetAddress";
import AddCustomization from "./customizationInputs/AddCustomization";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import SelectVariant from "./SelectVariant";
import OrderReviewAndPay from "./OrderReviewAndPay";
import { Container } from "@mui/material";

export default function OrderPage() {
  const { step, setStep, product, order, setOrder } = useOrderStore();

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
      setOrder(response?.data?.data);
      return response?.data?.data;
    },
  });

  useEffect(() => {
    if (product && !order) {
      actionCreateOrder.mutate();
    }
  }, []);

  const needToSelectVariant =
    Object.keys(product?.variants || {}).length > 0 && !order?.info?.variant;

  console.log(needToSelectVariant, order?.info?.variant);

  return (
    <Container>
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
      <LoadingErrorRQ q={actionCreateOrder} />
    </Container>
  );
}
