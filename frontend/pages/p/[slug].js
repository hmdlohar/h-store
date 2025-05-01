import EcomHead from "@/common/EcomHead";
import HomePage from "@/components/index/HomePage";
import ProductDetailPage from "@/components/products/ProductDetailPage";
import ProductList from "@/components/products/ProductsPage";
import MainLayout from "@/layout/MainLayout";
import { ApiService } from "@/services/ApiService";
import { useRouter } from "next/router";

export const getServerSideProps = async ({ query }) => {
  const { slug } = query;

  const product = await ApiService.call(`/api/products/${slug}`);

  return {
    props: {
      slug,
      product,
    },
  };
};

export default function ProductDetail({ product }) {
  console.log("Product:", product);
  return (
    <>
      <EcomHead title="Products" />

      <MainLayout>
        <ProductDetailPage product={product} />
      </MainLayout>
    </>
  );
}
