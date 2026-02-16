import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Typography,
  Box,
  Rating,
  Pagination,
  Avatar,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/router";

const getImageUrl = (path) => {
  if (!path) return "/favicon.ico";
  if (path.startsWith('http')) return path;
  return `https://ik.imagekit.io/id4vmvhgeh/${path}?1=1&tr=w-40`;
};

export default function ReviewsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const productId = router.query.productId;

  const q = useQuery({
    queryKey: ["admin-reviews", page, productId],
    queryFn: async () => {
      let url = `/api/admin/reviews?page=${page}&limit=${limit}`;
      if (productId) url += `&productId=${productId}`;
      const res = await ApiService.call(url, "get");
      return res;
    },
    refetchOnMount: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await ApiService.call(`/api/admin/reviews/${id}`, "delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-reviews"]);
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Customer Reviews
      </Typography>

      <LoadingErrorRQ q={q} />

      {q.data && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Review</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {q.data.reviews.map((review) => (
                  <TableRow key={review._id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={getImageUrl(review.productId?.mainImage?.imagePath)}
                          sx={{ width: 32, height: 32 }}
                          variant="rounded"
                        />
                        <Box sx={{ maxWidth: 200 }}>
                           <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                             {review.productId?.name || "Deleted Product"}
                           </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{review.userName}</TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {review.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {review.content}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(review._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={q.data.pages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
}
