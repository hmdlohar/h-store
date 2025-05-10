import EcomHead from "@/common/EcomHead";
import HomePage from "@/components/index/HomePage";
import MainLayout from "@/layout/MainLayout";
import { ApiService } from "@/services/ApiService";

export async function getStaticProps() {
  const res = await ApiService.call("/api/public/home-page-config", "get");
  return {
    props: { homePageConfig: res },
  };
}

export default function Home({ homePageConfig }) {
  return (
    <>
      <EcomHead />

      <MainLayout>
        <HomePage homePageConfig={homePageConfig} />
      </MainLayout>
    </>
  );
}
