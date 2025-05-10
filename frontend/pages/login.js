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
        <AuthGuard>You are logged in</AuthGuard>
      </MainLayout>
    </>
  );
}
