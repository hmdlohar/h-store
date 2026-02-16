import React, { useState } from "react";
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Divider,
  Button,
  Stack,
  IconButton,
  Grid,
  LinearProgress,
  Alert,
} from "@mui/material";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import ReviewForm from "./ReviewForm";

const ProductReviews = ({ productId }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const reviewsQuery = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const res = await ApiService.call(
        `/api/reviews/product/${productId}`,
        "get",
      );
      return res;
    },
    enabled: !!productId,
  });

  if (reviewsQuery.isLoading) return <LinearProgress />;
  if (reviewsQuery.isError)
    return <Alert severity="error">Error loading reviews</Alert>;

  const reviews = reviewsQuery.data || [];
  console.log("Reviews for", productId, reviews);

  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={4}>
        {/* Left Column - CTA */}
        {/* <Grid item xs={12} md={4}>
          <Box sx={{ position: { md: 'sticky' }, top: 100 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Review this product
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Share your thoughts with other customers
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsFormOpen(true)}
              sx={{
                textTransform: 'none',
                color: '#0f1111',
                borderColor: '#d5d9d9',
                borderRadius: '8px',
                py: 0.75,
                fontWeight: 600,
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f7fafa', borderColor: '#d5d9d9' }
              }}
            >
              Write a customer review
            </Button>
          </Box>
        </Grid> */}

        {/* Right Column - Reviews List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Top reviews
          </Typography>
          <Stack spacing={4}>
            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No reviews yet. Be the first to review this product!
              </Typography>
            ) : (
              reviews.map((review) => (
                <Box key={review._id}>
                  {/* User Header */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Avatar
                      src={review.userImage}
                      sx={{ width: 32, height: 32, mr: 1.5, bgcolor: "#ccc" }}
                    >
                      {review.userName.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 400 }}>
                      {review.userName}
                    </Typography>
                  </Box>

                  {/* Rating & Title */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{ mr: 1, color: "#f08804" }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {review.title}
                    </Typography>
                  </Box>

                  {/* Meta Info */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.25 }}
                  >
                    Reviewed in {review.location} on{" "}
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>

                  {review.variantInfo && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#565959",
                        fontWeight: 700,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {review.variantInfo}
                    </Typography>
                  )}

                  {review.isVerifiedPurchase && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#c45500",
                        fontWeight: 700,
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Verified Purchase
                    </Typography>
                  )}

                  {/* Content */}
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, lineHeight: 1.5, color: "#111" }}
                  >
                    {review.content}
                  </Typography>

                </Box>
              ))
            )}
          </Stack>
        </Grid>
      </Grid>

      <ReviewForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productId={productId}
      />
    </Box>
  );
};

export default ProductReviews;
