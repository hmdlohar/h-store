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
  Select,
  InputAdornment,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useState } from "react";

const TYPE_COLORS = {
  sms: "info",
  email: "warning",
  whatsapp: "success",
};

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

export default function MessageTemplatesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    isActive: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "sms",
    subject: "",
    content: "",
    isActive: true,
  });
  const [previewVars, setPreviewVars] = useState({});
  const pageSize = 20;

  const q = useQuery({
    queryKey: ["admin-message-templates", page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.isActive && { isActive: filters.isActive }),
      });
      const res = await ApiService.call(`/api/admin/message-templates?${params}`, "get");
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await ApiService.call("/api/admin/message-templates", "post", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-message-templates"]);
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await ApiService.call(`/api/admin/message-templates/${id}`, "put", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-message-templates"]);
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await ApiService.call(`/api/admin/message-templates/${id}`, "delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-message-templates"]);
    },
  });

  const previewMutation = useMutation({
    mutationFn: async (data) => {
      return await ApiService.call("/api/admin/message-templates/preview", "post", data);
    },
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      type: "sms",
      subject: "",
      content: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject || "",
      content: template.content,
      isActive: template.isActive,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const openPreviewDialog = async (template) => {
    const initialVars = {};
    (template.variables || []).forEach((v) => {
      initialVars[v] = "";
    });
    setPreviewVars(initialVars);
    setEditingTemplate(template);
    setPreviewDialogOpen(true);
  };

  const handlePreview = () => {
    previewMutation.mutate({
      content: editingTemplate.content,
      subject: editingTemplate.subject,
      variables: previewVars,
    });
  };

  const handleSubmit = () => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  const extractVariables = (text) => {
    if (!text) return [];
    const regex = /\$\{([^}]+)\}/g;
    const vars = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      vars.push(match[1]);
    }
    return [...new Set(vars)];
  };

  const contentVariables = extractVariables(formData.content);
  const subjectVariables = extractVariables(formData.subject);
  const allVariables = [...new Set([...contentVariables, ...subjectVariables])];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Message Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Create Template
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
          <TextField
            size="small"
            placeholder="Search by name or content..."
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
              value={filters.isActive}
              label="Status"
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <LoadingErrorRQ q={q} />

      {q.data && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Content Preview</TableCell>
                  <TableCell>Variables</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {q.data.templates?.map((template) => (
                  <TableRow key={template._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {template.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.type}
                        color={TYPE_COLORS[template.type] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {template.subject || "-"}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {template.content?.substring(0, 50)}...
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" gap={0.5} flexWrap="wrap">
                        {(template.variables || []).slice(0, 3).map((v) => (
                          <Chip key={v} label={`\${${v}}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                        ))}
                        {(template.variables || []).length > 3 && (
                          <Chip label={`+${template.variables.length - 3}`} size="small" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.isActive ? "Active" : "Inactive"}
                        color={template.isActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => openPreviewDialog(template)}
                        title="Preview"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(template)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(template._id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {q.data.templates?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No templates found
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

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? "Edit Template" : "Create Template"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              size="small"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!!editingTemplate}
              helperText="Unique identifier for this template"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Subject"
              fullWidth
              size="small"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              helperText="For email templates (use ${variable} for dynamic values)"
            />
            <TextField
              label="Content"
              fullWidth
              size="small"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={6}
              helperText="Use ${variableName} for dynamic values"
            />
            {allVariables.length > 0 && (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Detected variables: {allVariables.map(v => `\${${v}}`).join(", ")}
                </Typography>
              </Box>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending || !formData.name || !formData.content}
          >
            {editingTemplate ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Preview Template: {editingTemplate?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editingTemplate?.subject && (
              <Box>
                <Typography variant="caption" color="text.secondary">Subject</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{editingTemplate.subject}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Variables</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                {(editingTemplate?.variables || []).map((v) => (
                  <TextField
                    key={v}
                    size="small"
                    label={v}
                    value={previewVars[v] || ""}
                    onChange={(e) => setPreviewVars({ ...previewVars, [v]: e.target.value })}
                    sx={{ minWidth: 120 }}
                  />
                ))}
              </Stack>
            </Box>
            <Button variant="outlined" onClick={handlePreview} disabled={previewMutation.isPending}>
              Generate Preview
            </Button>
            {previewMutation.data && (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Preview</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                  {previewMutation.data.preview?.content}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
