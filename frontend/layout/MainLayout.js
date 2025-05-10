import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Button, IconButton, Link, Toolbar } from "@mui/material";
import NextLink from "next/link";
import MenuDrawer from "./MenuDrawer";
import { useCommonStore } from "../store/commonStore";
import EcomImage from "../common/EcomImage";

const MainLayout = ({ children }) => {
  const { toggleMenu } = useCommonStore();

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <MenuDrawer />
      <AppBar
        position="static"
        sx={{ backgroundColor: "#ffffff", color: "#000000", boxShadow: "none" }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <Box sx={{ flexGrow: 1 }}>
            <Link
              href="/"
              passHref
              component={NextLink}
              sx={{ cursor: "pointer" }}
            >
              <EcomImage
                src="/logo-landscape.png"
                alt="Logo"
                style={{
                  height: 50,
                }}
              />
            </Link>
          </Box>

          {/* Menu Icon (visible on all screen sizes) */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => toggleMenu(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box>{children}</Box>
    </main>
  );
};

export default MainLayout;
