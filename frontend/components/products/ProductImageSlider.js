import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import EcomImage from "@/common/EcomImage";

const ProductImageSlider = ({ images = [] }) => {
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  const goToPrev = () =>
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goToNext = () =>
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", md: 700 },
        mx: "auto",
        mb: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fafafa",
          borderRadius: 2,
          overflow: "hidden",
          p: 1,
        }}
      >
        <IconButton
          onClick={goToPrev}
          sx={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "rgba(0,0,0,0.15)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.3)" },
          }}
        >
          <ArrowBackIosNew fontSize="medium" />
        </IconButton>
        <Box
          component={EcomImage}
          path={images[current]}
          alt={`Product image ${current + 1}`}
          sx={{
            maxWidth: "100%",
            maxHeight: { xs: 370, md: 500 },
            objectFit: "contain",
            borderRadius: 1,
          }}
          adaptToMobile
        />
        <IconButton
          onClick={goToNext}
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "rgba(0,0,0,0.15)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.3)" },
          }}
        >
          <ArrowForwardIos fontSize="medium" />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
        {images.map((img, idx) => (
          <Box
            key={idx}
            component={EcomImage}
            path={img}
            small
            alt={`Thumbnail ${idx + 1}`}
            onClick={() => setCurrent(idx)}
            sx={{
              width: 56,
              height: 56,
              objectFit: "cover",
              borderRadius: 1,
              border:
                idx === current ? "2px solid #1976d2" : "2px solid transparent",
              cursor: "pointer",
              transition: "border 0.2s",
              boxShadow: idx === current ? 2 : 0,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

ProductImageSlider.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
};

export default ProductImageSlider;
