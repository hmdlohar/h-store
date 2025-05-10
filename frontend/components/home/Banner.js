import EcomImage from "@/common/EcomImage";
import { Container } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

const Banner = ({ data }) => {
  const { image, mobileImage, productSlug } = data;
  const router = useRouter();

  return (
    <Container sx={{ p: 2 }}>
      <EcomImage
        path={image}
        alt="Banner"
        style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: 10 }}
        onClick={() => {
          router.push(`/p/${productSlug}`);
        }}
      />
    </Container>
  );
};

export default Banner;
