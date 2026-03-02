import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useRouter } from "next/router";

export const adminMenuItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Products", href: "/admin/products" },
  { label: "Users", href: "/admin/users" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "User Insights", href: "/admin/insights" },
  { label: "Job Queue", href: "/admin/jobs" },
  { label: "Message Logs", href: "/admin/message-logs" },
  { label: "Message Templates", href: "/admin/message-templates" },
  { label: "Gift Shops", href: "/admin/gift-shops" },
];

export default function LeftAdminMenu({ width = 240, onNavigate }) {
  const router = useRouter();

  const isActiveRoute = (href) =>
    router.pathname === href || (href !== "/admin" && router.pathname.startsWith(`${href}/`));

  return (
    <Box
      sx={{
        width,
        height: "100%",
        minHeight: "100vh",
        borderRight: "1px solid #e0e0e0",
        overflowY: "auto",
        bgcolor: "background.paper",
      }}
    >
      <List dense>
        {adminMenuItems.map((item) => {
          const active = isActiveRoute(item.href);
          return (
            <ListItem
              key={item.label}
              sx={{
                bgcolor: active ? "primary.main" : "transparent",
                color: active ? "white" : "inherit",
                px: 1,
              }}
            >
              <ListItemButton
                onClick={() => {
                  router.push(item.href);
                  onNavigate?.();
                }}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
