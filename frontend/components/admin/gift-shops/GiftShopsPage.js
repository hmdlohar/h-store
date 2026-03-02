import DataTable from "@/common/data-table/DataTable";
import { ApiService } from "@/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "shopName",
        header: "Shop",
        size: 260,
        cell: ({ row }) => (
          <Box>
            <Typography fontWeight={600}>{row.original.shopName}</Typography>
            {row.original.shopPersonName ? (
              <Typography variant="caption" color="text.secondary">
                {row.original.shopPersonName}
              </Typography>
            ) : null}
          </Box>
        ),
      },
      {
        accessorKey: "mobileNumber",
        header: "Contact",
        size: 220,
        cell: ({ row }) => (
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="body2">{row.original.mobileNumber || "-"}</Typography>
              {row.original.mobileNumber ? (
                <IconButton
                  size="small"
                  component="a"
                  href={`tel:${row.original.mobileNumber}`}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ p: 0.25 }}
                >
                  <CallIcon fontSize="inherit" />
                </IconButton>
              ) : null}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {row.original.email || "-"}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 160,
        cell: ({ row }) => (
          <Chip
            size="small"
            label={GIFT_SHOP_STATUS_LABEL_MAP[row.original.status] || row.original.status || "-"}
            sx={{
              bgcolor: STATUS_COLOR_MAP[row.original.status]?.bg || "#ECEFF1",
              color: STATUS_COLOR_MAP[row.original.status]?.color || "#37474F",
              fontWeight: 600,
            }}
          />
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
        accessorKey: "source",
        header: "Source",
        size: 120,
        cell: ({ row }) => row.original.source || "-",
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
        size: 120,
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/admin/gift-shops/new")}
        >
          Add Gift Shop
        </Button>
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
                sx={{ cursor: "pointer" }}
                onClick={() => router.push(`/admin/gift-shops/${row._id}`)}
              >
                <CardContent sx={{ pb: "16px !important" }}>
                  <Stack spacing={0.6}>
                    <Typography fontWeight={700}>{row.shopName}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2">Mobile: {row.mobileNumber || "-"}</Typography>
                      {row.mobileNumber ? (
                        <IconButton
                          size="small"
                          component="a"
                          href={`tel:${row.mobileNumber}`}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ p: 0.25 }}
                        >
                          <CallIcon fontSize="inherit" />
                        </IconButton>
                      ) : null}
                    </Stack>
                    {row.email ? (
                      <Typography variant="body2" color="text.secondary">
                        {row.email}
                      </Typography>
                    ) : null}
                    <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
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
    </Box>
  );
}
