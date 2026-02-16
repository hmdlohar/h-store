import React from "react";
import { Box, Typography, Chip, Grid, Button, Container } from "@mui/material";
import NextLink from "next/link";
import EcomImage from "@/common/EcomImage";
import { useRouter } from "next/router";

const Product = ({ data }) => {
  const { product } = data;
  const router = useRouter();

  if (!product) return null;

  const { mainImage, images, price, mrp, name, slug, description } = product;
  const discountPercent = Math.round(((mrp - price) / mrp) * 100);
  const hasDiscount = mrp > price;

  return (
    <Container sx={{ mb: 4, p: 2 }}>
      <Grid
        container
        spacing={3}
        sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 1 }}
        onClick={() => {
          router.push(`/p/${slug}`);
        }}
      >
        {/* Left column - Main image */}
        <Grid item size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
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
              path={mainImage?.imagePath}
              alt={name}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 8,
              }}
              adaptToMobile
            />
          </Box>
        </Grid>

        {/* Right column - Details */}
        <Grid item size={{ xs: 12, md: 8 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {name}
          </Typography>

        {/* Pricing */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h4" fontWeight="bold">
                {(() => {
                  const variantPrices = Object.values(product.variants || {}).map(v => v.price).filter(p => p != null);
                  const allPrices = [price, ...variantPrices].filter(p => !isNaN(p));
                  const minPrice = Math.min(...allPrices);
                  const maxPrice = Math.max(...allPrices);
                  return maxPrice > minPrice ? `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}` : `₹${price.toLocaleString('en-IN')}`;
                })()}
            </Typography>
            {hasDiscount && (
              <Typography
                variant="h6"
                color="text.disabled"
                sx={{ textDecoration: "line-through" }}
              >
                ₹{mrp}
              </Typography>
            )}
          </Box>
        </Box>

        {description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{
              __html: description.substring(0, 200) + "...",
            }}
          />
        )}

        {/* Additional images row */}
        {images && images.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
              {images.slice(0, 5).map((img, index) => (
                <Box key={index} sx={{ minWidth: 60, width: 60 }}>
                  <EcomImage
                    path={img.imagePath}
                    small
                    alt={`${name} view ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 4,
                      border: "1px solid #eee"
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Button
          component={NextLink}
          href={`/p/${slug}`}
          variant="contained"
          sx={{
            bgcolor: "#FFD814",
            color: "#0F1111",
            textTransform: "none",
            borderRadius: "20px",
            px: 6,
            py: 1.2,
            fontSize: "1rem",
            fontWeight: 600,
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default Product;
