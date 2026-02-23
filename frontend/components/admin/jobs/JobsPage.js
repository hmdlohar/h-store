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
  Pagination,
  TextField,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import { useState } from "react";

const STATUS_COLORS = {
  pending: "warning",
  processing: "info",
  completed: "success",
  failed: "error",
};

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const JOB_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "order-notification", label: "Order Notification" },
];

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
  });
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({ type: "order-notification", context: "{}" });
  const pageSize = 20;

  const q = useQuery({
    queryKey: ["admin-jobs", page, filters],
    queryFn: async () => {
      const res = await ApiService.call("/api/admin/jobs", "post", {
        page,
        pageSize,
        ...filters,
      });
      return res;
    },
    refetchOnMount: true,
  });

  const statsQ = useQuery({
    queryKey: ["admin-jobs-stats"],
    queryFn: async () => {
      const res = await ApiService.call("/api/admin/jobs/stats", "get");
      return res;
    },
    refetchInterval: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await ApiService.call(`/api/admin/jobs/${id}`, "delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-jobs"]);
      queryClient.invalidateQueries(["admin-jobs-stats"]);
    },
  });

  const retryMutation = useMutation({
    mutationFn: async (id) => {
      return await ApiService.call(`/api/admin/jobs/retry/${id}`, "post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-jobs"]);
      queryClient.invalidateQueries(["admin-jobs-stats"]);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let context = {};
      try {
        context = JSON.parse(data.context || "{}");
      } catch (e) {
        context = { raw: data.context };
      }
      return await ApiService.call("/api/admin/jobs/create", "post", {
        type: data.type,
        context,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-jobs"]);
      queryClient.invalidateQueries(["admin-jobs-stats"]);
      setCreateDialogOpen(false);
      setNewJob({ type: "order-notification", context: "{}" });
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, jobIds }) => {
      return await ApiService.call("/api/admin/jobs/bulk-action", "post", {
        action,
        jobIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-jobs"]);
      queryClient.invalidateQueries(["admin-jobs-stats"]);
      setSelectedJobs([]);
    },
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleRetry = (id) => {
    retryMutation.mutate(id);
  };

  const handleCreateJob = () => {
    createMutation.mutate(newJob);
  };

  const handleBulkAction = (action) => {
    if (selectedJobs.length === 0) return;
    if (window.confirm(`Are you sure you want to ${action} ${selectedJobs.length} jobs?`)) {
      bulkActionMutation.mutate({ action, jobIds: selectedJobs });
    }
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === q.data?.jobs?.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(q.data?.jobs?.map((j) => j._id) || []);
    }
  };

  const toggleSelect = (id) => {
    setSelectedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const formatContext = (context) => {
    if (!context) return "-";
    try {
      return JSON.stringify(context);
    } catch {
      return String(context);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h5">Job Queue</Typography>
          <IconButton size="small" onClick={() => queryClient.invalidateQueries(["admin-jobs"])} title="Reload">
            <RefreshIcon />
          </IconButton>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Job
        </Button>
      </Stack>

      {statsQ.data && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {Object.entries(statsQ.data.byStatus || {}).map(([status, count]) => (
            <Chip
              key={status}
              label={`${status}: ${count}`}
              color={STATUS_COLORS[status] || "default"}
              variant="outlined"
            />
          ))}
        </Stack>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
          <TextField
            size="small"
            placeholder="Search by ID, type, error..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Job Type</InputLabel>
            <Select
              value={filters.type}
              label="Job Type"
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              {JOB_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedJobs.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PlayIcon />}
                onClick={() => handleBulkAction("retry")}
              >
                Retry ({selectedJobs.length})
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleBulkAction("delete")}
              >
                Delete ({selectedJobs.length})
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      <LoadingErrorRQ q={q} />

      {q.data && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedJobs.length === q.data.jobs?.length && q.data.jobs?.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Context</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Error</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Processed</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {q.data.jobs?.map((job) => (
                  <TableRow
                    key={job._id}
                    hover
                    selected={selectedJobs.includes(job._id)}
                  >
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job._id)}
                        onChange={() => toggleSelect(job._id)}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {job._id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {formatContext(job.context)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={STATUS_COLORS[job.status] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant="caption" color="error">
                        {job.error || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(job.createdAt)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(job.processedAt)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleRetry(job._id)}
                        disabled={job.status === "processing"}
                        title="Retry"
                      >
                        <RefreshIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(job._id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {q.data.jobs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No jobs found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={q.data.pagination?.totalPages || 1}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Job</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 400 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Job Type</InputLabel>
              <Select
                value={newJob.type}
                label="Job Type"
                onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
              >
                {JOB_TYPE_OPTIONS.filter(o => o.value).map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Context (JSON)"
              multiline
              rows={4}
              size="small"
              value={newJob.context}
              onChange={(e) => setNewJob({ ...newJob, context: e.target.value })}
              helperText="Enter JSON object for job context"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateJob}
            disabled={createMutation.isPending}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
