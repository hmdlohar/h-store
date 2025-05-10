import AuthGuard from "@/guards/AuthGuard";
import { useCommonStore } from "@/store/commonStore";
import { Box } from "@mui/material";
import LeftAdminMenu from "./LeftAdminMenu";

export default function AdminLayout({ children }) {
  const { user } = useCommonStore();
  return (
    <AuthGuard isAdmin={true}>
      <Box component="main" sx={{ height: "100vh", display: "flex" }}>
        <LeftAdminMenu />
        <Box sx={{ flexGrow: 1, padding: 2 }}>{children}</Box>
      </Box>
    </AuthGuard>
  );
}
