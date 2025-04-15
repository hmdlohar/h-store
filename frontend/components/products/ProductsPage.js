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

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const { category } = router.query;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url =
          "https://2001-idx-h-storegit-1744479460751.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev/api/products";
        if (category) {
          url += `?category=${category}`; // Assuming your API supports category filtering
        }
        const response = await fetch(url);
        if (response.ok) {
          const data = (await response.json()).data;
          setProducts(data);
          // Extract categories for filter (assuming products have a 'category' field)
          const uniqueCategories = [
            ...new Set(data.map((product) => product.category)),
          ];
          setCategories(uniqueCategories);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [category]);

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    router.push({
      pathname: "/products",
      query: selectedCategory ? { category: selectedCategory } : {},
    });
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        {category ? `${category} Gifts` : "All Products"}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="category-select-label">Filter by Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={category || ""}
            label="Filter by Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <ProductItem product={product} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default ProductList;
