import React from "react";
import { Box, Typography, Grid, Container } from "@mui/material";
import ProductItem from "@/components/products/ProductItem";

const ProductRow = ({ data }) => {
  const { title, products } = data;

  if (!products || products.length === 0) return null;

  return (
    <Container sx={{ mb: 4, p: 2 }}>
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          {title}
        </Typography>

        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item size={{ xs: 6, sm: 6, md: 3 }} key={product._id}>
              <ProductItem product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductRow;
