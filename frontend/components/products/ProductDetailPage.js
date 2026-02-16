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
  Rating,
} from "@mui/material";
import AddToCartAction from "./AddToCartAction";
import ProductImageSlider from "./ProductImageSlider";
import NextLink from "next/link";

import { marked } from "marked";

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

function markdownToHtml(md) {
  if (!md) return "";
  return marked.parse(md);
}

const ProductDetailPage = ({ product }) => {
  const { mainImage, price, mrp, description, name, rating, reviewCount, boughtCount } = product;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const discount = Math.round(((mrp - price) / mrp) * 100);
  const displayRating = (rating || 0).toFixed(1);

  return (
    <Container sx={{ py: 2 }}>
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
            <Typography variant="h5" sx={{ fontWeight: 400, fontSize: '1.25rem', mb: 0.5 }}>
              {name}
            </Typography>

            {/* Ratings & Social Proof */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 0.5, fontWeight: 700 }}>{displayRating}</Typography>
                  <Rating value={parseFloat(displayRating)} readOnly size="small" precision={0.1} />
               </Box>
               <Typography variant="body2" sx={{ color: '#007185' }}>{reviewCount} ratings</Typography>
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              {boughtCount > 0 ? `${boughtCount}+ bought in past month` : 'Popular choice'}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Pricing Section */}
            {(() => {
              const variantPrices = Object.values(product.variants || {}).map(v => v.price).filter(p => p != null);
              const allPrices = [price, ...variantPrices].filter(p => !isNaN(p));
              const minPrice = Math.min(...allPrices);
              const maxPrice = Math.max(...allPrices);
              const hasPriceRange = maxPrice > minPrice;

              return (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    {!hasPriceRange && (
                       <Typography variant="h4" sx={{ color: '#CC0C39', fontWeight: 300 }}>
                          -{discount}%
                       </Typography>
                    )}
                    <Typography variant="h4" sx={{ fontWeight: 500 }}>
                      {hasPriceRange ? (
                        <>₹{minPrice.toLocaleString('en-IN')} - ₹{maxPrice.toLocaleString('en-IN')}</>
                      ) : (
                        <>₹{price.toLocaleString('en-IN')}</>
                      )}
                    </Typography>
                  </Box>
                  {!hasPriceRange && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      M.R.P.: <Typography component="span" variant="caption" sx={{ textDecoration: 'line-through' }}>₹{mrp.toLocaleString('en-IN')}</Typography>
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 400 }}>
                    Inclusive of all taxes
                  </Typography>
                </Box>
              );
            })()}

            <Divider sx={{ mb: 2 }} />

            {/* Delivery Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                FREE delivery
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Product Specifications Section */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, fontSize: '1.25rem' }}>
                  Product details
                </Typography>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="tbody">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <Box component="tr" key={key} sx={{ borderBottom: '1px solid #eee' }}>
                        <Box component="td" sx={{ py: 1, fontWeight: 700, width: '40%', color: 'text.secondary', fontSize: '0.85rem' }}>
                          {key}
                        </Box>
                        <Box component="td" sx={{ py: 1, color: 'text.primary', fontSize: '0.85rem' }}>
                          {value}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Divider sx={{ mt: 3 }} />
              </Box>
            )}

            {/* Features/Description */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>
              About this item
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              component="div"
              sx={{ 
                whiteSpace: "pre-line", 
                lineHeight: 1.6,
                '& strong': { fontWeight: 700 },
                '& ul, & ol': { pl: 3, mb: 1 },
                '& li': { mb: 0.5 }
              }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(description) }}
            />

            {/* Desktop Buy Now Button */}
            <Box
              display={{ xs: "none", md: "flex" }}
              gap={2}
              mt={4}
              sx={{ pt: 2 }}
            >
              <AddToCartAction product={product} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Mobile Buy Now Action - Sticky at bottom */}
      <Box display={{ xs: "block", md: "none" }}>
        <AddToCartAction product={product} />
      </Box>

    </Container>
  );
};

export default ProductDetailPage;
