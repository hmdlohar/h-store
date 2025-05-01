import EcomHead from "@/common/EcomHead";
import ProfilePage from "@/components/profile/ProfilePage";
import AuthGuard from "@/guards/AuthGuard";
import MainLayout from "@/layout/MainLayout";

export default function Profile() {
  return (
    <>
      <EcomHead title="Profile" />

      <MainLayout>
        <AuthGuard>
          <ProfilePage />
        </AuthGuard>
      </MainLayout>
    </>
  );
}
