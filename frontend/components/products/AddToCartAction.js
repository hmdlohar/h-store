import React from "react";
import { Box, Button, useTheme, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";
import { useOrderStore } from "@/store/orderStore";
import { useRouter } from "next/router";
import { insightService } from "@/services/InsightService";
import { fbPixel } from "@/services/FacebookPixelService";

const AddToCartAction = ({ product, disabled, label = "Buy Now" }) => {
  const router = useRouter();
  const { reset, setProduct, order } = useOrderStore();

  return (
    <Box
      sx={{
        position: {
          xs: "fixed",
          md: "sticky",
        },
        left: { xs: 0, md: "unset" },
        right: { xs: 0, md: "unset" },
        bottom: { xs: 0, md: 0 },
        top: { md: "100%" },
        bgcolor: "background.paper",
        boxShadow: { xs: 4, md: 0 },
        zIndex: { xs: 1300, md: "auto" },
        p: 2,
        display: "flex",
        justifyContent: "center",
        width: { xs: "100%", md: "100%" },
        maxWidth: { xs: "100%", md: 500 },
        mx: { xs: 0, md: "auto" },
        mb: { xs: 0, md: 3 },
      }}
    >
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={() => {
          if (product?._id !== order?.items?.[0]?.productId) {
            reset();
          }
          setProduct(product);
          
          // Track AddToCart event
          fbPixel.addToCart({
            content_ids: [product._id],
            content_name: product.name,
            content_type: "product",
            value: product.price,
            currency: "INR",
          });
          
          insightService.trackEvent("add_to_cart", {
            productId: product._id,
            productName: product.name,
            price: product.price,
          });
          router.push("/order");
        }}
        disabled={disabled}
        sx={{
          bgcolor: "#FFD814",
          color: "#0F1111",
          textTransform: "none",
          borderRadius: "100px",
          fontWeight: 700,
          border: "1px solid #FCD200",
          boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
          "&:hover": {
            bgcolor: "#F7CA00",
            borderColor: "#F2C200",
          },
        }}
      >
        {label}
      </Button>
    </Box>
  );
};

AddToCartAction.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

export default AddToCartAction;
