import EcomHead from "@/common/EcomHead";
import OrderDetailPage from "@/components/order/OrderDetailPage";
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
          {orderId && <OrderDetailPage orderId={orderId} />}
        </AuthGuard>
      </MainLayout>
    </>
  );
}
