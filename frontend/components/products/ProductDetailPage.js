import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EcomImage from "@/common/EcomImage";
import ProductImageSlider from "./ProductImageSlider";
import AddToCartAction from "./AddToCartAction";

// Minimal Markdown parser: supports **bold**, *italic*, and line breaks. Not for untrusted input!
function markdownToHtml(md) {
  if (!md) return "";
  let html = md
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // italic
    .replace(/\n/g, "<br/>"); // line breaks
  return html;
}

const ProductDetailPage = ({ product }) => {
  const { mainImage, price, mrp, description } = product;

  const discount = Math.round(((mrp - price) / mrp) * 100);

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
      {/* Image Slider */}
      <ProductImageSlider
        images={[
          mainImage.imagePath,
          ...product.images.map((img) => img.imagePath),
        ]}
      />

      {/* Title */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {product.name}
      </Typography>

      {/* Pricing */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="h5" fontWeight="bold">
          ₹{price}.00
        </Typography>
        <Typography
          variant="body2"
          sx={{ textDecoration: "line-through", color: "text.disabled" }}
        >
          ₹{mrp}.00
        </Typography>
        <Chip label={`${discount}% OFF`} color="success" size="small" />
      </Box>

      {/* Pincode check */}
      <Typography variant="body2" mt={2}>
        Enter correct Pincode for hassle free timely delivery.
      </Typography>
      <TextField
        placeholder="Enter Pincode"
        size="small"
        fullWidth
        margin="dense"
        InputProps={{
          startAdornment: <LocationOnIcon sx={{ mr: 1 }} />,
        }}
      />

      {/* Description */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Descriptions
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        component="div"
        sx={{ whiteSpace: "pre-line" }}
        dangerouslySetInnerHTML={{ __html: markdownToHtml(description) }}
      />

      {/* Action Button (desktop only) */}
      <Box display={{ xs: 'none', md: 'flex' }} gap={2} mt={3}>
        <Button variant="contained" fullWidth onClick={() => {}}>
          Add To Cart
        </Button>
      </Box>

      {/* Mobile Add To Cart Action */}
      <AddToCartAction onClick={() => {}} />

      {/* Recently Viewed Placeholder */}
      <Divider sx={{ my: 5 }} />
      <Typography variant="h6" fontWeight="bold">
        Recently Viewed By You
      </Typography>
      <Typography variant="body2" color="text.secondary">
        No Recently Viewed product Found
      </Typography>
    </Box>
  );
};

export default ProductDetailPage;
