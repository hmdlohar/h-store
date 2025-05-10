import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PolicyIcon from "@mui/icons-material/Policy";
import SecurityIcon from "@mui/icons-material/Security";
import GavelIcon from "@mui/icons-material/Gavel";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import NextLink from "next/link";
import { useCommonStore } from "../store/commonStore";
import LogoutIcon from "@mui/icons-material/Logout";
import EcomImage from "../common/EcomImage";
import LoginIcon from "@mui/icons-material/Login";
const MenuDrawer = () => {
  const { isMenuOpen, toggleMenu, user, setLogin } = useCommonStore();

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, link: "/" },
    { text: "Products", icon: <ShoppingBagIcon />, link: "/products" },
    ...(user
      ? [{ text: "Orders", icon: <ShoppingBagIcon />, link: "/orders" }]
      : []),
    ,
    { text: "Contact Us", icon: <ContactMailIcon />, link: "/contact" },
    { text: "Privacy Policy", icon: <SecurityIcon />, link: "/privacy-policy" },
    {
      text: "Terms of Service",
      icon: <GavelIcon />,
      link: "/terms-of-service",
    },
    {
      text: "Return Policy",
      icon: <AssignmentReturnIcon />,
      link: "/return-policy",
    },
    ...(user
      ? [
          {
            text: "Logout",
            icon: <LogoutIcon />,
            onClick: () => {
              setLogin({ user: null, token: null });
            },
          },
        ]
      : [{ text: "Login", icon: <LoginIcon />, link: "/login" }]),
  ];

  return (
    <Drawer anchor="right" open={isMenuOpen} onClose={() => toggleMenu(false)}>
      <Box sx={{ width: 280, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box component={NextLink} href="/" sx={{ cursor: "pointer" }}>
            <EcomImage
              src="/logo-landscape.png"
              alt="Logo"
              style={{ height: 40 }}
            />
          </Box>
          <IconButton onClick={() => toggleMenu(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={item.link ? NextLink : "button"}
                href={item.link}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  toggleMenu(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default MenuDrawer;
