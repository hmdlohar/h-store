import React from "react";
import { Grid, Paper, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";

const categories = [
  {
    name: "Best Sellers",
    imageUrl: "https://picsum.photos/200/200?best",
  },
  {
    name: "Birthday Gifts",
    imageUrl: "https://picsum.photos/200/200?birthday",
  },
  {
    name: "Anniversary Gifts",
    imageUrl: "https://picsum.photos/200/200?anniversary",
  },
  {
    name: "Wedding Gifts",
    imageUrl: "https://picsum.photos/200/200?wedding",
  },
  {
    name: "Gifts Under ₹99",
    imageUrl: "https://picsum.photos/200/200?discount",
  },
  {
    name: "Premium Gifts",
    imageUrl: "https://picsum.photos/200/200?premium",
  },
];

const CategoryList = () => {
  const router = useRouter();

  const handleCategoryClick = (categoryName) => {
    router.push({
      pathname: "/products", // Assuming you have a products page
      query: { category: categoryName },
    });
  };

  return (
    <Grid container spacing={1}>
      {categories.map((category) => (
        <Grid item size={{ xs: 4 }} key={category.name}>
          <Paper
            sx={{
              p: 1,
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => handleCategoryClick(category.name)}
          >
            <img
              src={category.imageUrl}
              alt={category.name}
              style={{
                borderRadius: "50%",
                marginBottom: 10,
                width: "100%",
              }}
            />
            <Typography variant="body2" sx={{ fontSize: 12 }}>
              {category.name}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default CategoryList;
