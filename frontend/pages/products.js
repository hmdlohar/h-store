import EcomHead from "@/common/EcomHead";
import ProductList from "@/components/products/ProductsPage";
import MainLayout from "@/layout/MainLayout";

export default function Products() {
  return (
    <>
      <EcomHead title="Products" />

      <MainLayout>
        <ProductList />
      </MainLayout>
    </>
  );
}
