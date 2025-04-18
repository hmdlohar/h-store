import EcomHead from "@/common/EcomHead";
import HomePage from "@/components/index/HomePage";
import MainLayout from "@/layout/MainLayout";

export default function Home() {
  return (
    <>
      <EcomHead />

      <MainLayout>
        <HomePage />
      </MainLayout>
    </>
  );
}
