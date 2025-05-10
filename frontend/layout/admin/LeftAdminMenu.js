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
      label: "Orders",
      href: "/admin/orders",
    },
    {
      label: "Users",
      href: "/admin/users",
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
