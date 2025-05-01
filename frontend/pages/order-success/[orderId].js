import EcomHead from "@/common/EcomHead";
import OrderSuccessPage from "@/components/order/order-success/OrderSuccessPage";
import AuthGuard from "@/guards/AuthGuard";
import MainLayout from "@/layout/MainLayout";
import { useRouter } from "next/router";

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
  return (
    <>
      <EcomHead title="Order" />

      <MainLayout>
        <AuthGuard>
          {orderId && <OrderSuccessPage orderId={orderId} />}
        </AuthGuard>
      </MainLayout>
    </>
  );
}
