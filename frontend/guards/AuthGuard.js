import { useRouter } from "next/router";
import { useCommonStore } from "@/store/commonStore";
import LoadingOverlay from "@/common/LoadingOverlay";
import LoginMSG91 from "@/components/login/LoginMSG91";
import { useEffect } from "react";
import { ApiService } from "@/services/ApiService";

export default function AuthGuard({ children, isAdmin = false }) {
  const { user, authToken } = useCommonStore();

  //   if (user === undefined) {
  //     return <LoadingOverlay />;
  //   }

  if (!user) {
    return (
      <div>
        <LoginMSG91 />
      </div>
    );
  }

  if (isAdmin && user.role !== "admin") {
    return <div>You are not authorized to access this page</div>;
  }

  return children;
}
