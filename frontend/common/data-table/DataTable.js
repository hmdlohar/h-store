import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Box,
  Checkbox,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function DataTable({
  columns,
  data,
  rowCount = 0,
  page = 0,
  pageSize = 10,
  sorting = [],
  globalFilter = "",
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onGlobalFilterChange,
  loading = false,
  checkboxSelection = false,
  onRowClick,
  getRowId = (row) => row._id || row.id,
}) {
  const [localSorting, setLocalSorting] = useState(sorting);
  const [localGlobalFilter, setLocalGlobalFilter] = useState(globalFilter);

  const handleSort = (columnId) => {
    const newSorting = localSorting.map((s) =>
      s.id === columnId ? { ...s, desc: !s.desc } : s
    );
    const exists = newSorting.find((s) => s.id === columnId);
    if (!exists) {
      newSorting.push({ id: columnId, desc: false });
    }
    setLocalSorting(newSorting);
    onSortingChange?.(newSorting);
  };

  const handleSearch = (value) => {
    setLocalGlobalFilter(value);
    onGlobalFilterChange?.(value);
  };

  const tableColumns = useMemo(() => {
    if (checkboxSelection) {
      return [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              indeterminate={table.getIsSomeRowsSelected()}
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              size="small"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              size="small"
              onClick={(e) => e.stopPropagation()}
            />
          ),
          size: 40,
        },
        ...columns,
      ];
    }
    return columns;
  }, [columns, checkboxSelection]);

  const table = useReactTable({
    data: data || [],
    columns: tableColumns,
    pageCount: Math.ceil(rowCount / pageSize),
    state: {
      sorting: localSorting,
      globalFilter: localGlobalFilter,
    },
    onSortingChange: handleSort,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    getRowId,
  });

  return (
    <Paper elevation={1} sx={{ width: "100%", overflow: "hidden" }}>
      {onGlobalFilterChange && (
        <Box sx={{ p: 2, pb: 0 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={localGlobalFilter}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>
      )}

      <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
        <Table stickyHeader size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      width: header.getSize(),
                      fontWeight: 600,
                      bgcolor: "grey.100",
                    }}
                    sortDirection={
                      localSorting.find((s) => s.id === header.id)?.desc
                        ? "desc"
                        : "asc"
                    }
                  >
                    {header.column.getCanSort() ? (
                      <TableSortLabel
                        active={
                          localSorting.some((s) => s.id === header.id)
                        }
                        direction={
                          localSorting.find((s) => s.id === header.id)?.desc
                            ? "desc"
                            : "asc"
                        }
                        onClick={() => handleSort(header.id)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableSortLabel>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  selected={row.getIsSelected()}
                  onClick={() => onRowClick?.(row.original)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rowCount}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={(e, newPage) => onPageChange?.(newPage)}
        onRowsPerPageChange={(e) =>
          onPageSizeChange?.(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={[10, 25, 50, 100]}
        showFirstButton
        showLastButton
      />
    </Paper>
  );
}
