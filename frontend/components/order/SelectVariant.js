import React, { useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import {
  Typography,
  Box,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { prettyPrice } from "hyper-utils";
import { useMutation } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import OrderStepWrapper from "./OrderStepWrapper";

export default function SelectVariant() {
  const { product, setStep, setOrder, order, step, hasVariants } = useOrderStore();
  const [selectedVariant, setSelectedVariant] = useState(order?.info?.variant || null);

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
      setStep(3);
    },
  });

  const handleVariantSelect = (key) => {
    setSelectedVariant(key);
    setOrder({
      ...order,
      info: { ...order.info, variant: key },
      items: order.items.map(item => ({
        ...item,
        price: product.variants[key].price,
        amount: product.variants[key].price
      }))
    });
    actionUpdateVariant.mutate(key);
  };

  const variants = Object.entries(product.variants || {});

  const handleBack = () => setStep(step - 1);
  const handleContinue = () => {
    if (selectedVariant) {
      handleVariantSelect(selectedVariant);
    }
  };
  const canContinue = selectedVariant && !actionUpdateVariant.isPending;

  return (
    <OrderStepWrapper
      title="Choose Size"
      onBack={handleBack}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
      continueLoading={actionUpdateVariant.isPending}
      continueText="Continue"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {variants.map(([key, variant]) => {
          const isSelected = selectedVariant === key;
          return (
            <Box
              key={key}
              onClick={() => !actionUpdateVariant.isPending && handleVariantSelect(key)}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                bgcolor: isSelected ? '#e3f2fd' : '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: actionUpdateVariant.isPending ? 'not-allowed' : 'pointer',
                opacity: actionUpdateVariant.isPending ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                {isSelected ? (
                  <CheckCircleIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                ) : (
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: '2px solid #bdbdbd',
                    }}
                  />
                )}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {key}
                  </Typography>
                  {variant.maxLength && (
                    <Typography variant="caption" color="text.secondary">
                      Up to {variant.maxLength} chars
                    </Typography>
                  )}
                </Box>
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                {prettyPrice(variant.price)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <LoadingErrorRQ q={actionUpdateVariant} />
    </OrderStepWrapper>
  );
}
