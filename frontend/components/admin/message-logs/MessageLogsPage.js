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
  FormControl,
  InputLabel,
  InputAdornment,
  Select,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useState } from "react";

const STATUS_COLORS = {
  pending: "warning",
  sent: "success",
  failed: "error",
};

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
];

export default function MessageLogsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  });
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const pageSize = 20;

  const q = useQuery({
    queryKey: ["admin-message-logs", page, filters],
    queryFn: async () => {
      const res = await ApiService.call("/api/admin/message-logs", "post", {
        page,
        pageSize,
        ...filters,
      });
      return res;
    },
    refetchOnMount: true,
  });

  const statsQ = useQuery({
    queryKey: ["admin-message-logs-stats"],
    queryFn: async () => {
      const res = await ApiService.call("/api/admin/message-logs/stats", "get");
      return res;
    },
    refetchInterval: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await ApiService.call(`/api/admin/message-logs/${id}`, "delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-message-logs"]);
      queryClient.invalidateQueries(["admin-message-logs-stats"]);
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, logIds }) => {
      return await ApiService.call("/api/admin/message-logs/bulk-action", "post", {
        action,
        logIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-message-logs"]);
      queryClient.invalidateQueries(["admin-message-logs-stats"]);
      setSelectedLogs([]);
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
    if (window.confirm("Are you sure you want to delete this log?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedLogs.length === 0) return;
    if (window.confirm(`Are you sure you want to ${action} ${selectedLogs.length} logs?`)) {
      bulkActionMutation.mutate({ action, logIds: selectedLogs });
    }
  };

  const toggleSelectAll = () => {
    if (selectedLogs.length === q.data?.logs?.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(q.data?.logs?.map((l) => l._id) || []);
    }
  };

  const toggleSelect = (id) => {
    setSelectedLogs((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const openDetailDialog = (log) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h5">Message Logs</Typography>
          <IconButton size="small" onClick={() => queryClient.invalidateQueries(["admin-message-logs"])} title="Reload">
            <RefreshIcon />
          </IconButton>
        </Stack>
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
            placeholder="Search by recipient or content..."
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              {TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
          {selectedLogs.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleBulkAction("delete")}
              >
                Delete ({selectedLogs.length})
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
                      checked={selectedLogs.length === q.data.logs?.length && q.data.logs?.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Error</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {q.data.logs?.map((log) => (
                  <TableRow
                    key={log._id}
                    hover
                    selected={selectedLogs.includes(log._id)}
                  >
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log._id)}
                        onChange={() => toggleSelect(log._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {log.info?.templateUsed ? (
                        <Chip label={log.info.templateUsed} size="small" color="primary" variant="outlined" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.to}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.subject || "-"}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.content || "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        color={STATUS_COLORS[log.status] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Typography variant="caption" color="error">
                        {log.error || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(log._id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {q.data.logs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No message logs found
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

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Message Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Typography variant="body1">{selectedLog.type}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">To</Typography>
                <Typography variant="body1">{selectedLog.to}</Typography>
              </Box>
              {selectedLog.subject && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Subject</Typography>
                  <Typography variant="body1">{selectedLog.subject}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Content</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedLog.content}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedLog.status}
                  color={STATUS_COLORS[selectedLog.status] || "default"}
                  size="small"
                />
              </Box>
              {selectedLog.error && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Error</Typography>
                  <Typography variant="body1" color="error">{selectedLog.error}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Created</Typography>
                <Typography variant="body1">{formatDate(selectedLog.createdAt)}</Typography>
              </Box>
              {selectedLog.info && Object.keys(selectedLog.info).length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Additional Info</Typography>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {JSON.stringify(selectedLog.info, null, 2)}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
