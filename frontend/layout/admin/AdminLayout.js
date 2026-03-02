import AuthGuard from "@/guards/AuthGuard";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import LeftAdminMenu, { adminMenuItems } from "./LeftAdminMenu";

const SIDEBAR_WIDTH = 240;

export default function AdminLayout({ children }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const active = adminMenuItems.find((item) =>
      router.pathname === item.href || router.pathname.startsWith(`${item.href}/`),
    );
    return active?.label || "Admin";
  }, [router.pathname]);

  return (
    <AuthGuard isAdmin={true}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {isMobile ? (
          <>
            <AppBar position="sticky" color="inherit" elevation={1}>
              <Toolbar>
                <IconButton edge="start" onClick={() => setMobileDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {pageTitle}
                </Typography>
              </Toolbar>
            </AppBar>
            <Drawer
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              ModalProps={{ keepMounted: true }}
            >
              <LeftAdminMenu
                width={SIDEBAR_WIDTH}
                onNavigate={() => setMobileDrawerOpen(false)}
              />
            </Drawer>
          </>
        ) : null}

        <Box sx={{ display: "flex", minHeight: isMobile ? "auto" : "100vh" }}>
          {!isMobile ? <LeftAdminMenu width={SIDEBAR_WIDTH} /> : null}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              p: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
