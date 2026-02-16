import React from "react";
import { Box, Typography, Grid, Container, Button } from "@mui/material";
import ProductItem from "@/components/products/ProductItem";
import Link from "next/link";

const ProductRow = ({ data }) => {
  const { title, products } = data;

  if (!products || products.length === 0) return null;

  return (
    <Container sx={{ mb: 4, p: 2 }}>
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {title}
          </Typography>
          <Button component={Link} variant="contained" color="primary" href="/products" size="small">
            View All
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {products.map((product) => (
            <ProductItem key={product._id} product={product} />
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default ProductRow;
