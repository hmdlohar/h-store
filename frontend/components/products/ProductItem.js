import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import EcomImage from '@/common/EcomImage';

const ProductItem = ({ product }) => {
  if (!product) {
    return null; // Or a "Loading" or "No Product" message
  }

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Use EcomImage for the product image */}
        <EcomImage
          path={product.image}
          alt={product.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
            {product.name}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            ₹{product.price}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ProductItem;