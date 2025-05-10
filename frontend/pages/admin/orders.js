import NoSSR from "@/common/NoSSR";
import OrdersPage from "@/components/admin/orders/OrdersPage";
import AdminLayout from "@/layout/admin/AdminLayout";

export default function AdminOrders() {
  return (
    <AdminLayout>
      <NoSSR>
        <OrdersPage />
      </NoSSR>
    </AdminLayout>
  );
}
