import React, { useState } from "react";
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";

const ReviewForm = ({ productId, open, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    content: "",
    userName: "",
  });
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: async (data) => {
      return await ApiService.call("/api/reviews", "post", {
        ...data,
        productId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["product-reviews", productId]);
      queryClient.invalidateQueries(["product-detail", productId]); // Also update average rating on page
      onClose();
      setFormData({ rating: 5, title: "", content: "", userName: "" });
      setError(null);
    },
    onError: (err) => {
      setError(err?.message || "Failed to submit review. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.userName || !formData.title || !formData.content) {
      setError("Please fill in all fields.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create Review</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                Overall rating
              </Typography>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, rating: newValue });
                }}
                size="large"
                sx={{ color: '#f08804' }}
              />
            </Box>

            <TextField
              label="Your name"
              fullWidth
              required
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="How should we display your name?"
            />

            <TextField
              label="Add a headline"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's most important to know?"
            />

            <TextField
              label="Add a written review"
              fullWidth
              required
              multiline
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="What did you like or dislike? What did you use this product for?"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} sx={{ color: '#0f1111', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            sx={{
              bgcolor: '#ffd814',
              color: '#0f1111',
              textTransform: 'none',
              borderRadius: '8px',
              px: 4,
              boxShadow: '0 2px 5px rgba(213,217,217,.5)',
              border: '1px solid #fcd200',
              '&:hover': {
                bgcolor: '#f7ca00',
                borderColor: '#f2c200',
                boxShadow: '0 2px 5px rgba(213,217,217,.5)',
              }
            }}
          >
            {mutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReviewForm;
