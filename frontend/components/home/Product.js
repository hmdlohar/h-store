import React from "react";
import { Box, Typography, Chip, Grid, Button, Container } from "@mui/material";
import NextLink from "next/link";
import EcomImage from "@/common/EcomImage";

const Product = ({ data }) => {
  const { product } = data;

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
            />
          </Box>
        </Grid>

        {/* Right column - Details */}
        <Grid item size={{ xs: 12, md: 8 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {name}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              ₹{price}
            </Typography>

            {hasDiscount && (
              <Typography
                variant="body1"
                color="text.disabled"
                sx={{ textDecoration: "line-through" }}
              >
                ₹{mrp}
              </Typography>
            )}
          </Box>

          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
              dangerouslySetInnerHTML={{
                __html: description.substring(0, 150) + "...",
              }}
            />
          )}

          {/* Additional images */}
          {images && images.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                {images.slice(0, 5).map((img, index) => (
                  <Grid item size={{ xs: 2 }} key={index}>
                    <EcomImage
                      path={img.imagePath}
                      small
                      alt={`${name} view ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 4,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Button
            component={NextLink}
            href={`/p/${slug}`}
            variant="contained"
            color="primary"
            fullWidth
          >
            View Details
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Product;
