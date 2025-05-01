import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import {
  Box,
  Typography,
  Card,
  Chip,
  CircularProgress,
  Stack,
  styled,
  Grid,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { prettyPrice } from "hyper-utils";
import { useTheme } from "@emotion/react";
import EcomImage from "@/common/EcomImage";

export default function OrderListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const theme = useTheme();

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", page],
    queryFn: async () => {
      const res = await ApiService.call(`/api/order?page=${page}`, "get");
      return res;
    },
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">
          Error loading orders: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 2, maxWidth: "600px", margin: "0 auto" }}>
      <Stack spacing={1.5}>
        {orders?.map((order) => (
          <Card
            sx={{
              padding: 2,
              backgroundColor: "background.paper",
              boxShadow: "none",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
            key={order._id}
            onClick={() => router.push(`/order/${order._id}`)}
          >
            <Grid container spacing={2}>
              <Grid item size={4}>
                <EcomImage
                  small
                  path={order.product?.mainImage?.imagePath}
                  alt={order.product?.name}
                  style={{
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              </Grid>
              <Grid item size={8}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      Order #{order.orderNumber}
                      <br />
                      <div
                        style={{
                          width: 150,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {order.product?.name}
                      </div>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      {prettyPrice(order.amount)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {format(
                        new Date(order.createdAt),
                        "MMM dd, yyyy hh:mm a"
                      )}
                    </Typography>
                    <StatusChip status={order.status} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Stack>

      {orders?.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No orders found
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function StatusChip({ status }) {
  const theme = useTheme();
  return (
    <>
      {status === "pending" && (
        <Chip label="Pending" color="warning" size="small" />
      )}
      {status === "paid" && <Chip label="Paid" color="success" size="small" />}
      {status === "cancelled" && (
        <Chip label="Cancelled" color="error" size="small" />
      )}
    </>
  );
}
