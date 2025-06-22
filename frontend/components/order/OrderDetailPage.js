import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import EcomImage from "@/common/EcomImage";
import { prettyPrice } from "hyper-utils";

export default function OrderDetailPage({ orderId }) {
  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: async () => {
      const res = await ApiService.call(`/api/order/${orderId}`, "get");
      return res;
    },
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !orderData) {
    return <LoadingErrorRQ query={{ error, isLoading }} />;
  }

  // Get the first item (most orders will have just one item)
  const item = orderData.items?.[0] || {};

  // Get customization definitions from product if available
  const customizationsDef = orderData.product?.customizations || [];

  // Map customization fields to their definitions for better display
  const customizationMap = {};
  if (customizationsDef.length > 0 && item.customization) {
    customizationsDef.forEach((def) => {
      if (item.customization[def.field]) {
        customizationMap[def.field] = {
          value: item.customization[def.field],
          label: def.label,
          fieldType: def.fieldType,
          options: def.options,
        };
      }
    });
  }

  return (
    <Box maxWidth={480} mx="auto" mt={4} p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Order Details</Typography>
        <Chip
          label={orderData.status?.toUpperCase() || "PENDING"}
          color={orderData.status === "paid" ? "success" : "warning"}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Order #{orderData.orderNumber || "N/A"}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Order Items */}
      {orderData.items?.map((item, index) => (
        <Box key={index} mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item size={4}>
              {orderData.product?.mainImage?.imagePath ? (
                <EcomImage
                  path={orderData.product.mainImage.imagePath}
                  thumbnail
                  style={{ width: "100%", borderRadius: 8 }}
                  alt={orderData.product.name}
                  adaptToMobile
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 80,
                    bgcolor: "grey.200",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    No image
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item size={8}>
              <Typography variant="subtitle1" fontWeight={600}>
                {orderData.product.name}
              </Typography>
              {item.variant && (
                <Typography variant="body2" color="text.secondary">
                  Variant: {item.variant}
                </Typography>
              )}
              <Box mt={1}>
                <Typography variant="body2">
                  Price: {prettyPrice(item.price)}
                </Typography>
                <Typography variant="body2">
                  Quantity: {item.quantity || 1}
                </Typography>
                {item.tax > 0 && (
                  <Typography variant="body2">
                    Tax: {prettyPrice(item.tax)}
                  </Typography>
                )}
                <Typography variant="subtitle2" fontWeight={700}>
                  Total: {prettyPrice(item.amount)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Customization - Using the pattern from OrderReviewAndPay.js */}
          {item.customization && Object.keys(item.customization).length > 0 && (
            <Box
              mt={2}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight={500} mb={1}>
                Customization
              </Typography>
              {Object.entries(customizationMap).map(([field, def]) => {
                const value = item.customization[field];

                // Handle image customization
                if (def.fieldType === "image" && value) {
                  return (
                    <Box key={field} mb={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {def.label}:
                      </Typography>
                      <EcomImage
                        path={value}
                        small
                        style={{ maxWidth: 100, borderRadius: 4 }}
                        alt={def.label}
                      />
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  );
                }

                // Handle color customization
                if (def.fieldType === "color" && value) {
                  const colorName =
                    def.options?.find((o) => o.code === value)?.name || value;
                  return (
                    <Box key={field} mb={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {def.label}:
                      </Typography>
                      <Chip
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <div
                              style={{
                                background: value,
                                width: 24,
                                height: 24,
                                borderRadius: 100,
                                border:
                                  value === "#FFFFFF"
                                    ? "1px solid #ddd"
                                    : "none",
                              }}
                            ></div>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {colorName}
                            </Typography>
                          </Box>
                        }
                      />
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  );
                }

                // Handle text customization
                if (def.fieldType === "text" && value) {
                  return (
                    <Box key={field} mb={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {def.label}:
                      </Typography>
                      <Typography variant="body2">{value}</Typography>
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  );
                }

                // Fallback for any other type of customization
                if (value) {
                  return (
                    <Box key={field} mb={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {def.label || field}:
                      </Typography>
                      <Typography variant="body2">
                        {value.toString()}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  );
                }

                return null;
              })}

              {/* For customizations without definitions */}
              {Object.entries(item.customization)
                .filter(([field]) => !customizationMap[field])
                .map(([field, value]) => {
                  if (
                    typeof value === "string" &&
                    (value.includes("/") || value.includes("http"))
                  ) {
                    return (
                      <Box key={field} mb={1}>
                        <Typography variant="body2" fontWeight={500}>
                          {field}:
                        </Typography>
                        <EcomImage
                          path={value}
                          small
                          style={{ maxWidth: 100, borderRadius: 4 }}
                          alt={field}
                        />
                      </Box>
                    );
                  }

                  return (
                    <Box key={field} mb={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {field}:
                      </Typography>
                      <Typography variant="body2">
                        {value.toString()}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          )}

          {index < orderData.items.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Price Summary */}
      <Box
        mb={3}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 2,
        }}
      >
        <Typography variant="subtitle1" mb={1}>
          Price Details
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Subtotal</Typography>
          <Typography variant="body2">
            {prettyPrice(orderData.amount)}
          </Typography>
        </Box>
        {orderData.tax > 0 && (
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Tax</Typography>
            <Typography variant="body2">
              {prettyPrice(orderData.tax)}
            </Typography>
          </Box>
        )}
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={700}>
            Total Amount
          </Typography>
          <Typography variant="subtitle2" fontWeight={700}>
            {prettyPrice(orderData.amount)}
          </Typography>
        </Box>
      </Box>

      {/* Delivery Address */}
      {orderData.deliveryAddress && (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography variant="subtitle1" mb={1}>
            Delivery Address
          </Typography>
          <Box mb={2}>
            <Typography variant="body2">
              {orderData.deliveryAddress?.name || ""}
            </Typography>
            <Typography variant="body2">
              {orderData.deliveryAddress?.mobile || ""}
            </Typography>
            {orderData.deliveryAddress?.home &&
              orderData.deliveryAddress?.area && (
                <Typography variant="body2">
                  {orderData.deliveryAddress.home},{" "}
                  {orderData.deliveryAddress.area}
                </Typography>
              )}
            {(orderData.deliveryAddress?.city ||
              orderData.deliveryAddress?.state) && (
              <Typography variant="body2">
                {[
                  orderData.deliveryAddress.city,
                  orderData.deliveryAddress.state,
                  orderData.deliveryAddress.pincode &&
                    `- ${orderData.deliveryAddress.pincode}`,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            )}
            <Typography variant="body2">
              {orderData.deliveryAddress?.country || "India"}
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 2,
        }}
      >
        <Typography variant="subtitle1" mb={1}>
          Order Information
        </Typography>
        <Box mb={2}>
          <Typography variant="body2">
            Order Date:{" "}
            {orderData.createdAt
              ? new Date(orderData.createdAt).toLocaleString()
              : "N/A"}
          </Typography>
          <Typography variant="body2">
            Payment Method:{" "}
            {orderData.pg
              ? orderData.pg.charAt(0).toUpperCase() + orderData.pg.slice(1)
              : "N/A"}
          </Typography>
          {orderData.pgOrderID && (
            <Typography variant="body2">
              Payment ID: {orderData.pgOrderID}
            </Typography>
          )}
          {orderData.status && (
            <Typography variant="body2">
              Status:{" "}
              {orderData.status.charAt(0).toUpperCase() +
                orderData.status.slice(1)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
