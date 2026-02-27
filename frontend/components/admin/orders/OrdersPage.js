import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/common/data-table/DataTable";
import OrderDetailModal from "./OrderDetailModal";
import { ApiService } from "@/services/ApiService";
import { Chip, Box, Typography, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Stack } from "@mui/material";
import { format } from "date-fns";

const statusColors = {
  paid: "success",
  pending: "warning",
  cancelled: "error",
  delivered: "info",
  processing: "secondary",
};

const statusOptions = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [excludePending, setExcludePending] = useState(false);

  const buildQueryParams = useCallback(() => {
    const params = {
      page: pagination.page + 1,
      pageSize: pagination.pageSize,
    };

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.sortOrder = sorting[0].desc ? "desc" : "asc";
    }

    if (statusFilter) {
      params.status = statusFilter;
    }

    if (excludePending) {
      params.excludePending = true;
    }

    return params;
  }, [pagination.page, pagination.pageSize, globalFilter, sorting, statusFilter, excludePending]);

  const q = useQuery({
    queryKey: ["orders", pagination, sorting, globalFilter, statusFilter, excludePending],
    queryFn: async () => {
      const params = buildQueryParams();
      const res = await ApiService.call("/api/admin/orders", "post", params);
      return res;
    },
  });

  const columns = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      size: 120,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      size: 160,
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date ? format(new Date(date), "MMM dd, yyyy • h:mm a") : "N/A";
      },
    },
    {
      accessorKey: "deliveryAddress.name",
      header: "Customer",
      size: 150,
      cell: ({ row }) => row.original.deliveryAddress?.name || "N/A",
    },
    {
      accessorKey: "deliveryAddress.mobile",
      header: "Mobile",
      size: 120,
      cell: ({ row }) => row.original.deliveryAddress?.mobile || "N/A",
    },
    {
      accessorKey: "items",
      header: "Items",
      size: 80,
      cell: ({ row }) => row.original.items?.length || 0,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 100,
      cell: ({ row }) => `₹${row.original.amount}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110,
      cell: ({ row }) => (
        <Chip
          label={row.original.status}
          size="small"
          color={statusColors[row.original.status] || "default"}
        />
      ),
    },
    {
      accessorKey: "pg",
      header: "Payment",
      size: 100,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Orders
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 0 }));
            }}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={excludePending}
              onChange={(e) => {
                setExcludePending(e.target.checked);
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
            />
          }
          label="Exclude Pending"
        />
      </Stack>

      <DataTable
        columns={columns}
        data={q.data?.data || []}
        rowCount={q.data?.total || 0}
        page={pagination.page}
        pageSize={pagination.pageSize}
        sorting={sorting}
        globalFilter={globalFilter}
        loading={q.isLoading}
        onPageChange={(newPage) =>
          setPagination((prev) => ({ ...prev, page: newPage }))
        }
        onPageSizeChange={(newPageSize) =>
          setPagination((prev) => ({ ...prev, page: 0, pageSize: newPageSize }))
        }
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        onRowClick={(row) => setSelectedOrder(row)}
      />

      <OrderDetailModal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </Box>
  );
}
