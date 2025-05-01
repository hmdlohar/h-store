import AuthGuard from "@/guards/AuthGuard";
import MainLayout from "@/layout/MainLayout";
import Head from "next/head";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <MainLayout>
        <AuthGuard>Hi i am not here</AuthGuard>
      </MainLayout>
    </>
  );
}
