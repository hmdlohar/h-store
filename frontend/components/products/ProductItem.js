import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import EcomImage from "@/common/EcomImage";
import NextLink from "next/link";

const ProductItem = ({ product }) => {
  const { mainImage, price, mrp, description } = product;

  const discountPercent = Math.round(((mrp - price) / mrp) * 100);
  const hasDiscount = mrp > price;

  return (
    <Box
      component={NextLink}
      href={`/p/${product.slug}`}
      sx={{
        boxShadow: 3,
        borderRadius: 2,
        position: "relative",
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 6 },
      }}
    >
      {hasDiscount && (
        <Chip
          label={`${discountPercent}% OFF`}
          color="success"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            fontWeight: "bold",
            zIndex: 1,
          }}
        />
      )}

      <EcomImage
        path={mainImage.imagePath}
        alt="product"
        style={{
          width: "100%",
        }}
        thumbnail 
      />

      <CardContent sx={{ px: 1, py: 1 }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          {product.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            ₹{price}
          </Typography>

          {hasDiscount && (
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ textDecoration: "line-through" }}
            >
              ₹{mrp}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Box>
  );
};

export default ProductItem;
