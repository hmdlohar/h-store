import EcomHead from "@/common/EcomHead";
import HomePage from "@/components/index/HomePage";
import ProductDetailPage from "@/components/products/ProductDetailPage";
import ProductList from "@/components/products/ProductsPage";
import MainLayout from "@/layout/MainLayout";
import { ApiService } from "@/services/ApiService";
import { useRouter } from "next/router";

export async function getStaticPaths() {
  // Fetch all product slugs
  const products = await ApiService.call("/api/products");

  // Generate paths for each product
  const paths = products.map((product) => ({
    params: { slug: product.slug },
  }));

  return {
    paths,
    fallback: "blocking", // Show a loading state while new pages are generated
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  try {
    const product = await ApiService.call(`/api/products/${slug}`);

    return {
      props: {
        product,
      },
      // revalidate: 60, // Regenerate page after 60 seconds if requested
    };
  } catch (error) {
    return {
      notFound: true, // Return 404 page if product not found
    };
  }
}

export default function ProductDetail({ product }) {
  return (
    <>
      <EcomHead title={product?.name} description={product?.description} />

      <MainLayout>
        <ProductDetailPage product={product} />
      </MainLayout>
    </>
  );
}
