import EcomImage from "@/common/EcomImage";
import { Container, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

const Banner = ({ data }) => {
  const { image, mobileImage, productSlug } = data;
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 668px)");

  return (
    <Container sx={{ p: 2 }}>
      <EcomImage
        path={image}
        alt="Banner"
        style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: 10 }}
        onClick={() => {
          router.push(`/p/${productSlug}`);
        }}
        tr={isMobile ? "tr=w-350" : "tr=w-1000"}
      />
    </Container>
  );
};

export default Banner;
