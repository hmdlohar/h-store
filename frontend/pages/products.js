import EcomHead from "@/common/EcomHead";
import HomePage from "@/components/index/HomePage";
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
