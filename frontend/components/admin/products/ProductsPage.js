import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import { useRouter } from "next/router";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  RateReview as RateReviewIcon
} from "@mui/icons-material";

const getImageUrl = (path) => {
  if (!path) return "/favicon.ico";
  if (path.startsWith('http')) return path;
  return `https://ik.imagekit.io/id4vmvhgeh/${path}?1=1&tr=w-60`;
};

export default function ProductsPage() {
  const router = useRouter();

  const q = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await ApiService.call("/api/admin/products", "get");
      return res;
    },
    refetchOnMount: true,
  });

  const handleEdit = (productId) => {
    router.push(`/admin/products/${productId}`);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ApiService.call(`/api/admin/products/${productId}`, "delete");
        q.refetch();
      } catch (error) {
        alert("Error deleting product: " + error.message);
      }
    }
  };

  const getVariantsSummary = (variants) => {
    if (!variants || typeof variants !== 'object') return '-';
    return Object.entries(variants)
      .map(([key, value]) => `${key}: ₹${value.price || 0}`)
      .join(', ');
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" component="h1">
          Products
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/admin/products/new")}
        >
          Add New Product
        </Button>
      </Stack>

      <LoadingErrorRQ q={q} />

      {q.data && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={80}>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Variants</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {q.data.map((product) => (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Avatar
                      src={getImageUrl(product.mainImage?.imagePath)}
                      alt={product.name}
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={700} color="primary">
                      ₹{product.price}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {getVariantsSummary(product.variants)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.isActive ? "Active" : "Inactive"}
                      color={product.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => router.push(`/admin/reviews?productId=${product._id}`)}
                        title="View Reviews"
                      >
                        <RateReviewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(product._id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
