import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Grid,
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import ProductItem from "@/components/products/ProductItem";
import { HttpServiceAxios } from "hyper-utils";
import { ApiService } from "@/services/ApiService";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const { category } = router.query;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ApiService.call("/api/products");
        console.log("Response:", response);
        const data = response;
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        {category ? `${category} Gifts` : "All Products"}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {products.map((product) => (
          <ProductItem key={product._id} product={product} />
        ))}
      </Box>
    </Container>
  );
};

export default ProductList;
