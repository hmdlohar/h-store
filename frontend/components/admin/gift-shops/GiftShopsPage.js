import DataTable from "@/common/data-table/DataTable";
import { ApiService } from "@/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Add as AddIcon,
  Call as CallIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  GIFT_SHOP_STATUS_LABEL_MAP,
  GIFT_SHOP_STATUS_OPTIONS,
} from "./constants";

const STATUS_COLOR_MAP = {
  new: { bg: "#ECEFF1", color: "#37474F" },
  crm: { bg: "#E3F2FD", color: "#0D47A1" },
  call_attempted: { bg: "#FFF8E1", color: "#E65100" },
  interested: { bg: "#E8F5E9", color: "#1B5E20" },
  not_interested: { bg: "#FFEBEE", color: "#B71C1C" },
  positive_review: { bg: "#E0F2F1", color: "#004D40" },
  follow_up: { bg: "#FFF3E0", color: "#BF360C" },
  closed: { bg: "#F5F5F5", color: "#424242" },
};

export default function GiftShopsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const queryClient = useQueryClient();
  const [pageState, setPageState] = useState({ page: 0, pageSize: 20 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [status, setStatus] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [nextStatus, setNextStatus] = useState("new");
  const [statusComment, setStatusComment] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(pageState.page + 1));
    params.set("limit", String(pageState.pageSize));
    if (globalFilter.trim()) {
      params.set("q", globalFilter.trim());
    }
    if (status) {
      params.set("status", status);
    }
    return params.toString();
  }, [pageState.page, pageState.pageSize, globalFilter, status]);

  const q = useQuery({
    queryKey: ["admin-gift-shops", pageState, globalFilter, status],
    queryFn: async () => {
      return await ApiService.call(`/api/admin/gift-shops?${queryString}`, "get");
    },
    refetchOnMount: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await ApiService.call(`/api/admin/gift-shops/${id}`, "delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gift-shops"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ row, statusValue, comment }) => {
      const updated = await ApiService.call(`/api/admin/gift-shops/${row._id}`, "put", {
        ...row,
        status: statusValue,
      });
      if (comment) {
        await ApiService.call(`/api/admin/gift-shops/${row._id}/comments`, "post", {
          comment,
        });
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gift-shops"] });
      setStatusModalOpen(false);
      setSelectedShop(null);
      setStatusComment("");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Delete this gift shop record?")) {
      deleteMutation.mutate(id);
    }
  };

  const getLastComment = (comments = []) => {
    if (!Array.isArray(comments) || comments.length === 0) return "";
    return comments
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      )[0]?.comment;
  };

  const openStatusModal = (row) => {
    setSelectedShop(row);
    setNextStatus(row?.status || "new");
    setStatusComment("");
    setStatusModalOpen(true);
  };

  const handleOpenStatusModal = (e, row) => {
    e.preventDefault();
    e.stopPropagation();
    openStatusModal(row);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "shopName",
        header: "Shop",
        size: 420,
        cell: ({ row }) => (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Avatar
              src={row.original.photoLink || ""}
              variant="rounded"
              sx={{ width: 72, height: 72, fontSize: 12, flexShrink: 0 }}
            >
              GS
            </Avatar>
            <Box sx={{ minWidth: 0, pt: 0.1 }}>
              <Typography fontWeight={600}>{row.original.shopName}</Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                Person: {row.original.shopPersonName || "-"}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {row.original.mobileNumber || "-"}
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                <Chip
                  size="small"
                  label={GIFT_SHOP_STATUS_LABEL_MAP[row.original.status] || row.original.status || "-"}
                  sx={{
                    bgcolor: STATUS_COLOR_MAP[row.original.status]?.bg || "#ECEFF1",
                    color: STATUS_COLOR_MAP[row.original.status]?.color || "#37474F",
                    fontWeight: 600,
                    height: 20,
                  }}
                />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {row.original.source || "-"}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        ),
      },
      {
        accessorKey: "status",
        header: "Update",
        size: 140,
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => handleOpenStatusModal(e, row.original)}
            >
              Update
            </Button>
          </Stack>
        ),
      },
      {
        accessorKey: "comments",
        header: "Last Comment",
        size: 260,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 260,
            }}
          >
            {getLastComment(row.original.comments) || "-"}
          </Typography>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        size: 190,
        cell: ({ row }) =>
          new Date(row.original.updatedAt || row.original.createdAt).toLocaleString(),
      },
      {
        id: "actions",
        header: "Actions",
        size: 160,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            {row.original.websiteLink ? (
              <IconButton
                size="small"
                color="secondary"
                component="a"
                href={row.original.websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            ) : null}
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/gift-shops/${row.original._id}`);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.original._id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [router],
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Gift Shops</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={() => q.refetch()} title="Reload list">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/gift-shops/new")}
          >
            Add Gift Shop
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        {isMobile ? (
          <TextField
            label="Search"
            placeholder="Shop name, person, mobile, email"
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPageState((prev) => ({ ...prev, page: 0 }));
            }}
            fullWidth
          />
        ) : null}
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => {
            setPageState((prev) => ({ ...prev, page: 0 }));
            setStatus(e.target.value);
          }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All Status</MenuItem>
          {GIFT_SHOP_STATUS_OPTIONS.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {q.error ? <Alert severity="error">{q.error.message || "Failed to load gift shops"}</Alert> : null}

      {isMobile ? (
        <Box>
          <Stack spacing={1.5}>
            {(q.data?.giftShops || []).map((row) => (
              <Card
                key={row._id}
                variant="outlined"
                sx={{ cursor: "pointer", position: "relative" }}
                onClick={() => router.push(`/admin/gift-shops/${row._id}`)}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 0.5,
                    zIndex: 2,
                  }}
                >
                  {row.websiteLink ? (
                    <IconButton
                      size="small"
                      component="a"
                      href={row.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                    >
                      <OpenInNewIcon fontSize="inherit" />
                    </IconButton>
                  ) : null}
                  {row.mobileNumber ? (
                    <IconButton
                      size="small"
                      component="a"
                      href={`tel:${row.mobileNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                    >
                      <CallIcon fontSize="inherit" />
                    </IconButton>
                  ) : null}
                </Box>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Stack spacing={0.9}>
                    <Stack direction="row" spacing={1.25} alignItems="flex-start">
                      <Avatar
                        src={row.photoLink || ""}
                        variant="rounded"
                        sx={{ width: 72, height: 72, fontSize: 12, flexShrink: 0 }}
                      >
                        GS
                      </Avatar>
                      <Box sx={{ minWidth: 0, pt: 0.1 }}>
                        <Typography fontWeight={700}>{row.shopName}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          Person: {row.shopPersonName || "-"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          {row.mobileNumber || "-"}
                        </Typography>
                        <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" sx={{ mt: 0.25 }}>
                          <Chip
                            size="small"
                            label={GIFT_SHOP_STATUS_LABEL_MAP[row.status] || row.status || "-"}
                            sx={{
                              bgcolor: STATUS_COLOR_MAP[row.status]?.bg || "#ECEFF1",
                              color: STATUS_COLOR_MAP[row.status]?.color || "#37474F",
                              fontWeight: 600,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {row.source || "-"}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    {row.email ? (
                      <Typography variant="body2" color="text.secondary">
                        {row.email}
                      </Typography>
                    ) : null}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => handleOpenStatusModal(e, row)}
                      >
                        Update Status
                      </Button>
                    </Stack>
                    {getLastComment(row.comments) ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        Last note: {getLastComment(row.comments)}
                      </Typography>
                    ) : null}
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(row.updatedAt || row.createdAt).toLocaleString()}
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/gift-shops/${row._id}`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row._id);
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {!q.isLoading && (q.data?.giftShops || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No gift shops found.
              </Typography>
            ) : null}
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={Math.max(1, q.data?.pages || 1)}
              page={pageState.page + 1}
              color="primary"
              onChange={(_, page) => setPageState((prev) => ({ ...prev, page: page - 1 }))}
            />
          </Box>
        </Box>
      ) : (
        <DataTable
          columns={columns}
          data={q.data?.giftShops || []}
          rowCount={q.data?.total || 0}
          page={pageState.page}
          pageSize={pageState.pageSize}
          globalFilter={globalFilter}
          loading={q.isLoading || q.isFetching}
          onPageChange={(newPage) =>
            setPageState((prev) => ({ ...prev, page: newPage }))
          }
          onPageSizeChange={(newPageSize) =>
            setPageState({ page: 0, pageSize: newPageSize })
          }
          onGlobalFilterChange={(value) => {
            setGlobalFilter(value);
            setPageState((prev) => ({ ...prev, page: 0 }));
          }}
          onReload={() => q.refetch()}
          onRowClick={(row) => router.push(`/admin/gift-shops/${row._id}`)}
        />
      )}

      <Dialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Shop"
              value={selectedShop?.shopName || ""}
              disabled
              fullWidth
            />
            <TextField
              select
              label="New Status"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              fullWidth
            >
              {GIFT_SHOP_STATUS_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Comment"
              placeholder="Optional note for this status update"
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedShop || updateStatusMutation.isPending}
            onClick={() =>
              updateStatusMutation.mutate({
                row: selectedShop,
                statusValue: nextStatus,
                comment: statusComment.trim(),
              })
            }
          >
            {updateStatusMutation.isPending ? "Saving..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
