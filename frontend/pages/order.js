import EcomHead from "@/common/EcomHead";
import OrderPage from "@/components/order/OrderPage";
import AuthGuard from "@/guards/AuthGuard";
import MainLayout from "@/layout/MainLayout";

export default function Order() {
  return (
    <>
      <EcomHead title="Order" />

      <MainLayout>
        <AuthGuard>
          <OrderPage />
        </AuthGuard>
      </MainLayout>
    </>
  );
}
