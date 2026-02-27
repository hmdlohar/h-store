import AdminLayout from "@/layout/admin/AdminLayout";
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { ApiService } from "@/services/ApiService";

export default function RevalidatePage() {
  const [customPattern, setCustomPattern] = useState("");
  const [revalidating, setRevalidating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleRevalidate = async (path) => {
    if (!path) return;
    setRevalidating(true);
    try {
      await ApiService.call("/api/revalidate", "post", { path, secret: process.env.REVALIDATION_SECRET });
      setSnackbar({ open: true, message: `Revalidated: ${path}`, severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: "error" });
    } finally {
      setRevalidating(false);
    }
  };

  const handleRevalidateAll = async () => {
    await handleRevalidate("/products");
    await handleRevalidate("/");
  };

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h5" component="h1" gutterBottom>
          Revalidate Pages
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={revalidating ? <CircularProgress size={20} /> : <RefreshIcon />}
                  onClick={handleRevalidateAll}
                  disabled={revalidating}
                >
                  Revalidate Products & Home
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Custom Path
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="/products, /p/slug, /, etc."
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  sx={{ minWidth: 300 }}
                />
                <Button
                  variant="contained"
                  onClick={() => customPattern && handleRevalidate(customPattern)}
                  disabled={!customPattern || revalidating}
                >
                  Revalidate
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Examples: /, /products, /p/my-product-slug, /category/gifts
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
}
