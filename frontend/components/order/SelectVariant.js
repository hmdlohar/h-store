import React, { useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import {
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CheckCircle,
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
    mutationFn: async () => {
      const response = await ApiService.call(
        `/api/order/set-variant/${order._id}/${product._id}/${variant}`,
        "put"
      );
      setOrder(response);
      return response;
    },
  });

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        Select Variant
      </Typography>
      <List>
        {Object.keys(product.variants || {}).map((key) => (
          <ListItem key={key} disablePadding>
            <ListItemButton
              selected={variant === key}
              onClick={() => setVariant(key)}
              sx={{
                borderRadius: 2,
                mb: 1,
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
                  <Typography variant="body2" color="text.secondary">
                    {prettyPrice(product.variants[key].price)}
                  </Typography>
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
      {variant && (
        <Box mt={3}>
          <Typography variant="h6">
            Selected Price: {prettyPrice(product.variants[variant].price)}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              actionUpdateVariant.mutate();
            }}
            color="primary"
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}
