import React, { useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import posthog from "posthog-js";
import {
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { prettyPrice } from "hyper-utils";
import { useMutation } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";

export default function SelectVariant() {
  const { product, setStep, setOrder, order } = useOrderStore();
  const [variant, setVariant] = useState(null);

  const actionUpdateVariant = useMutation({
    mutationFn: async (variantKey) => {
      const response = await ApiService.call(
        `/api/order/set-variant/${order._id}/${product._id}/${variantKey}`,
        "put"
      );
      return response;
    },
    onSuccess: (response) => {
      setOrder(response);
      
    },
  });

  return (
    <Box p={0}>
      <Typography variant="h6" mb={1}>
        Select Variant
      </Typography>
      <List dense>
        {Object.keys(product.variants || {}).map((key) => (
          <ListItem key={key} disablePadding>
            <ListItemButton
              selected={variant === key}
              onClick={() => {
                setVariant(key);
                // Update order immediately to reflect price change in parent
                setOrder({
                  ...order,
                  info: { ...order.info, variant: key },
                  items: order.items.map(item => ({
                    ...item,
                    price: product.variants[key].price,
                    amount: product.variants[key].price
                  }))
                });
                // Call API to save variant and advance to next step
                actionUpdateVariant.mutate(key);
                posthog.capture("select_variant", {
                  productId: product._id,
                  productName: product.name,
                  productPrice: product.variants?.[key]?.price,
                  productImage: product.image,
                  productDescription: product.description,
                });
              }}
              disabled={actionUpdateVariant.isPending}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                py: 0.5,
                bgcolor: variant === key ? "primary.50" : "background.paper",
                border: variant === key ? "2px solid" : "1px solid",
                borderColor: variant === key ? "primary.main" : "grey.300",
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    fontWeight={variant === key ? 600 : 400}
                  >
                    {key}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                    <Typography variant="body2" color="text.secondary">
                      {prettyPrice(product.variants[key].price)}
                    </Typography>
                    {product.variants[key].maxLength && (
                      <Chip 
                        size="small" 
                        label={`Max ${product.variants[key].maxLength} chars`}
                        color={variant === key ? "primary" : "default"}
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </Box>
                }
              />
              {variant === key && (
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <LoadingErrorRQ q={actionUpdateVariant} />
    </Box>
  );
}
