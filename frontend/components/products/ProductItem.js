import React from "react";
import {
  Typography,
  Box,
  Button,
  Rating,
  Divider,
} from "@mui/material";
import EcomImage from "@/common/EcomImage";
import NextLink from "next/link";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ProductItem = ({ product }) => {
  const { mainImage, price, mrp, name, slug } = product;
  const discountPercent = Math.round(((mrp - price) / mrp) * 100);
  const hasDiscount = mrp > price;

  // Calculate price range from variants
  const variantPrices = Object.values(product.variants || {}).map(v => v.price).filter(p => p != null);
  const allPrices = [price, ...variantPrices].filter(p => !isNaN(p));
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const hasPriceRange = maxPrice > minPrice;

  // Mock data to match the requested aesthetics
  const rating = (Math.random() * (4.8 - 3.5) + 3.5).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 500) + 50;
  const boughtCount = Math.floor(Math.random() * 300) + 100;

  return (
    <Box
      sx={{
        borderBottom: "1px solid",
        borderColor: "grey.200",
        bgcolor: "background.paper",
        display: "flex",
        textDecoration: "none",
        color: "inherit",
        "&:hover": { bgcolor: "grey.50" },
        py: 2,
        gap: 2,
      }}
      component={NextLink}
      href={`/p/${slug}`}
    >
      {/* Product Image Section */}
      <Box sx={{ width: { xs: 120, sm: 180, md: 240 }, flexShrink: 0, position: 'relative' }}>
          <Box sx={{ 
            bgcolor: '#f7f7f7', 
            borderRadius: 1, 
            overflow: 'hidden',
            aspectRatio: '1/1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <EcomImage
                path={mainImage?.imagePath}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
                thumbnail 
            />
          </Box>
      </Box>

      {/* Product Content Section */}
      <Box sx={{ flexGrow: 1, pr: 1 }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontSize: '1rem',
            lineHeight: 1.3,
            fontWeight: 400,
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {name}
        </Typography>

        {/* Rating & Reviews */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" sx={{ mr: 0.5, color: '#e67a00', fontWeight: 700 }}>{rating}</Typography>
          <Rating value={parseFloat(rating)} readOnly size="small" precision={0.1} />
          <Typography variant="caption" color="primary.main" sx={{ ml: 0.5 }}>({reviewCount.toLocaleString()})</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {boughtCount.toLocaleString()}+ bought in past month
        </Typography>

        {/* Pricing */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {hasPriceRange ? (
                  <>₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}</>
                ) : (
                  <>₹{price.toLocaleString('en-IN')}</>
                )}
            </Typography>
            {!hasPriceRange && hasDiscount && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through", fontSize: '0.85rem' }}
              >
                M.R.P: ₹{mrp.toLocaleString('en-IN')}
              </Typography>
            )}
            {!hasPriceRange && hasDiscount && (
               <Typography variant="body2" color="error" sx={{ fontSize: '0.85rem' }}>
                ({discountPercent}% off)
              </Typography>
            )}
          </Box>
        </Box>

        {/* Delivery */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
            FREE delivery
          </Typography>
        </Box>

        {/* Action Button */}
        <Button
          variant="contained"
          sx={{
            bgcolor: "#FFD814",
            color: "#0F1111",
            textTransform: "none",
            borderRadius: "20px",
            px: 4,
            py: 0.5,
            fontSize: "0.85rem",
            boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
            border: "1px solid #FCD200",
            "&:hover": {
              bgcolor: "#F7CA00",
              borderColor: "#F2C200",
              boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
            },
          }}
        >
          Buy Now
        </Button>
      </Box>
    </Box>
  );
};

export default ProductItem;
