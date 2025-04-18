import AuthGuard from "@/guards/AuthGuard";
import MainLayout from "@/layout/MainLayout";
import Head from "next/head";

export default function Login() {
  return (
    <>
      <Head>
        <body></body>
      </Head>
      <MainLayout>
        <AuthGuard>Hi i am not here</AuthGuard>
      </MainLayout>
    </>
  );
}
