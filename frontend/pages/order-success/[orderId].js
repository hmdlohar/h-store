import EcomHead from "@/common/EcomHead";
import OrderSuccessPage from "@/components/order/order-success/OrderSuccessPage";
import MainLayout from "@/layout/MainLayout";
import { useRouter } from "next/router";

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
  return (
    <>
      <EcomHead title="Order" />

      <MainLayout>
        {orderId && <OrderSuccessPage orderId={orderId} />}
      </MainLayout>
    </>
  );
}
