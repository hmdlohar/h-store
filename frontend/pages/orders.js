import EcomHead from "@/common/EcomHead";
import OrderListPage from "@/components/order/OrderListPage";
import AuthGuard from "@/guards/AuthGuard";
import MainLayout from "@/layout/MainLayout";

export default function Orders() {
  return (
    <>
      <EcomHead title="Orders" />

      <MainLayout>
        <AuthGuard>
          <OrderListPage />
        </AuthGuard>
      </MainLayout>
    </>
  );
}
