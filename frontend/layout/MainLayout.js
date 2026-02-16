import { CONTACT_PHONE } from "../constants";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Toolbar,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import MenuDrawer from "./MenuDrawer";
import { useCommonStore } from "../store/commonStore";
import EcomImage from "../common/EcomImage";

const MainLayout = ({ children }) => {
  const { toggleMenu } = useCommonStore();

  return (
    <main style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <MenuDrawer />
      
      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes contact-pulse {
          0% { background-color: #FF6B6B; transform: scale(1); }
          50% { background-color: #E64A4A; transform: scale(1.02); }
          100% { background-color: #FF6B6B; transform: scale(1); }
        }
      `}} />

      {/* Spacer for fixed headers */}
      <Box sx={{ height: { xs: 90, sm: 100 } }} />

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#ffffff",
          color: "#000000",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* Contact Highlight Bar */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 0.5,
            textAlign: "center",
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            fontWeight: 700,
            cursor: "pointer",
            "&:hover": { bgcolor: "primary.dark" },
            overflow: "hidden",
          }}
          component="a"
          href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
        >
          <Container sx={{ 
            animation: "contact-pulse 2s ease-in-out infinite",
            display: "block"
          }}>
            For Any Queries / Customization : {CONTACT_PHONE} (Call or WhatsApp)
          </Container>
        </Box>

        <Container>
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: { xs: 56, sm: 64 },
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
                  src="/logo-landscape-small.png"
                  alt="Logo"
                  style={{
                    height: 40,
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
        </Container>
      </AppBar>

      <Box sx={{ flex: 1 }}>{children}</Box>
    </main>
  );
};

export default MainLayout;
