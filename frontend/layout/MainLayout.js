import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Box,
  Link,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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
              href="/about"
              sx={{ textTransform: "none" }}
            >
              About Us
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
            <IconButton color="inherit">
              <SearchIcon />
            </IconButton>
            <IconButton color="inherit">
              <PersonIcon />
            </IconButton>
            <IconButton color="inherit">
              <ShoppingCartIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, overflow: "auto" }}>
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: "#f0f0f0",
          display: { xs: "none", md: "block" },
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {"Copyright © "}
            <Link color="inherit" href="/">
              Your E-commerce Site
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "center", mt: 1, gap: 2 }}
          >
            <Link href="/about" color="inherit" underline="hover">
              About Us
            </Link>
            <Link href="/contact" color="inherit" underline="hover">
              Contact Us
            </Link>
            <Link href="/privacy" color="inherit" underline="hover">
              Privacy Policy
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Bottom Navigation (Mobile only) */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "white",
          zIndex: 1000,
        }}
      >
        <BottomNavigation
          showLabels
          // value={value}
          // onChange={(event, newValue) => {
          //     setValue(newValue);
          // }}
        >
          <BottomNavigationAction
            label="Home"
            icon={<HomeIcon />}
            component={NextLink}
            href="/"
          />
          <BottomNavigationAction
            label="Offers"
            icon={<LocalOfferIcon />}
            component={NextLink}
            href="/offers"
          />
          <BottomNavigationAction
            label="Account"
            icon={<AccountCircleIcon />}
            component={NextLink}
            href="/account"
          />
        </BottomNavigation>
      </Box>
    </main>
  );
};

export default MainLayout;
