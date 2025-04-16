import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddToCartAction from "./AddToCartAction";
import ProductImageSlider from "./ProductImageSlider";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const discount = Math.round(((mrp - price) / mrp) * 100);

  return (
    <Container>
      <Grid container spacing={3}>
        {/* Left Column - Image Slider */}
        <Grid item size={{ xs: 12, md: 6, lg: 5 }}>
          <ProductImageSlider
            images={[
              mainImage.imagePath,
              ...product.images.map((img) => img.imagePath),
            ]}
          />
        </Grid>

        {/* Right Column - Product Details */}
        <Grid item size={{ xs: 12, md: 6, lg: 7 }}>
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {/* Title */}
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {product.name}
            </Typography>

            {/* Pricing */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h4" fontWeight="bold">
                ₹{price}.00
              </Typography>
              <Typography
                variant="body1"
                sx={{ textDecoration: "line-through", color: "text.disabled" }}
              >
                ₹{mrp}.00
              </Typography>
              <Chip label={`${discount}% OFF`} color="success" size="small" />
            </Box>

            {/* Description */}
            <Divider sx={{ my: 2 }} />
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

            {/* Desktop Buy Now Button */}
            <Box
              display={{ xs: "none", md: "flex" }}
              gap={2}
              mt={3}
              sx={{ marginTop: "auto", pt: 3 }}
            >
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => {}}
              >
                Buy Now
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Mobile Buy Now Action - Sticky at bottom */}
      <Box display={{ xs: "block", md: "none" }}>
        <AddToCartAction onClick={() => {}} />
      </Box>

      {/* Recently Viewed Placeholder */}
      <Divider sx={{ my: 5 }} />
      <Typography variant="h6" fontWeight="bold">
        Recently Viewed By You
      </Typography>
      <Typography variant="body2" color="text.secondary">
        No Recently Viewed product Found
      </Typography>
    </Container>
  );
};

export default ProductDetailPage;
