import EcomImage from "@/common/EcomImage";
import { Container } from "@mui/material";
import React from "react";

const Banner = ({ data }) => {
  const { image, mobileImage } = data;

  return (
    <Container sx={{ p: 2 }}>
      <EcomImage
        path={image}
        alt="Banner"
        style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: 10 }}
      />
    </Container>
  );
};

export default Banner;
