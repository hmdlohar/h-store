import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useRouter } from "next/router";
export default function LeftAdminMenu() {
  const router = useRouter();
  const menuItems = [
    {
      label: "Dashboard",
      href: "/admin",
    },
    {
      label: "Orders",
      href: "/admin/orders",
    },
    {
      label: "Products",
      href: "/admin/products",
    },
    {
      label: "Users",
      href: "/admin/users",
    },
    {
      label: "Reviews",
      href: "/admin/reviews",
    },
    {
      label: "User Insights",
      href: "/admin/insights",
    },
    {
      label: "Job Queue",
      href: "/admin/jobs",
    },
    {
      label: "Message Logs",
      href: "/admin/message-logs",
    },
    {
      label: "Message Templates",
      href: "/admin/message-templates",
    },
  ];

  return (
    <Box
      sx={{
        width: 200,
        height: "100%",
        borderRight: "1px solid #e0e0e0",
        overflowY: "auto",
      }}
    >
      <List dense>
        {menuItems.map((item) => (
          <ListItem
            key={item.label}
            sx={{
              backgroundColor:
                router.pathname === item.href ? "primary.main" : "transparent",
              color: router.pathname === item.href ? "white" : "inherit",
            }}
          >
            <ListItemButton
              onClick={() => router.push(item.href)}
              sx={{
                cursor: "pointer",
              }}
            >
              <ListItemText>{item.label}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
