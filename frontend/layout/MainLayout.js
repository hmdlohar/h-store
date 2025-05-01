import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { AppBar, Box, Button, IconButton, Link, Toolbar } from "@mui/material";
import NextLink from "next/link";

const MainLayout = ({ children }) => {
  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
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
              <img
                src="/logo-landscape.png"
                alt="Logo"
                style={{
                  height: 50,
                }}
              />
            </Link>
          </Box>

          {/* Navigation Links (You can customize these links) */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button
              color="inherit"
              component={NextLink}
              href="/"
              sx={{ textTransform: "none" }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              component={NextLink}
              href="/products"
              sx={{ textTransform: "none" }}
            >
              Products
            </Button>

            <Button
              color="inherit"
              component={NextLink}
              href="/contact"
              sx={{ textTransform: "none" }}
            >
              Contact Us
            </Button>
          </Box>

          {/* Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton component={NextLink} href="/profile" color="inherit">
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box>{children}</Box>
    </main>
  );
};

export default MainLayout;
