import React, { useState } from "react";
import AdminLayout from "@/layout/admin/AdminLayout";
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  TextField,
  IconButton,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";

import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import DateDisplay from "@/common/DateDisplay";
import { useInsightsFilterStore } from "@/store/insightsFilterStore";

export default function AdminInsightsIndex() {
  const { 
    sortOption, 
    utmSource, 
    minViews, 
    maxViews, 
    setSortOption, 
    setUtmSource, 
    setMinViews, 
    setMaxViews,
    resetFilters 
  } = useInsightsFilterStore();
  
  const [sortBy, sortOrder] = sortOption.split('-');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [fetchingIps, setFetchingIps] = useState(new Set());
  
  const utmSources = useQuery({
    queryKey: ["admin-utm-sources"],
    queryFn: () => ApiService.call("/api/admin/insights/utm-sources"),
  });
  
  const sessions = useQuery({
    queryKey: ["admin-sessions", sortBy, sortOrder, utmSource, minViews, maxViews],
    queryFn: () => {
      let url = `/api/admin/insights/sessions?sortBy=${sortBy}&order=${sortOrder}`;
      if (utmSource && utmSource !== '') url += `&utmSource=${utmSource}`;
      if (minViews !== '') url += `&minViews=${minViews}`;
      if (maxViews !== '') url += `&maxViews=${maxViews}`;
      return ApiService.call(url);
    },
  });
  
  const fetchIpMutation = useMutation({
    mutationFn: async (ip) => {
      setFetchingIps(prev => new Set(prev).add(ip));
      const result = await ApiService.call("/api/admin/insights/fetch-ip-info", "post", { ip });
      setFetchingIps(prev => {
        const newSet = new Set(prev);
        newSet.delete(ip);
        return newSet;
      });
      return result;
    },
    onSuccess: (data) => {
      if (data.skipped) {
        setSnackbar({
          open: true,
          message: `IP ${data.ip} skipped: ${data.reason}`,
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Successfully fetched IP info for ${data.ip} (${data.country}) - Updated ${data.processed} sessions`,
          severity: 'success'
        });
        // Refetch sessions to show updated data
        sessions.refetch();
      }
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Failed to fetch IP info: ${error.message}`,
        severity: 'error'
      });
    }
  });

  return (
    <AdminLayout>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5">
              User Sessions & Insights
            </Typography>
            {sessions.data && (
              <Chip 
                size="small" 
                label={`${sessions.data.length} results`}
                color="default"
                variant="outlined"
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton 
                size="small" 
                onClick={() => {
                  utmSources.refetch();
                  sessions.refetch();
                }}
                disabled={sessions.isLoading || sessions.isFetching}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOption}
                label="Sort By"
                onChange={(e) => setSortOption(e.target.value)}
              >
                <MenuItem value="createdAt-desc">Created: Newest First</MenuItem>
                <MenuItem value="createdAt-asc">Created: Oldest First</MenuItem>
                <MenuItem value="updatedAt-desc">Updated: Newest First</MenuItem>
                <MenuItem value="updatedAt-asc">Updated: Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Autocomplete
            size="small"
            sx={{ minWidth: 200, maxWidth: 250 }}
            options={utmSources.data || []}
            value={utmSource || null}
            onChange={(e, newValue) => setUtmSource(newValue || '')}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="UTM Source" 
                placeholder="Select or type..."
              />
            )}
            freeSolo
            clearOnEscape
            loading={utmSources.isLoading}
          />
          
          <TextField
            size="small"
            label="Min Views"
            type="number"
            value={minViews}
            onChange={(e) => setMinViews(e.target.value)}
            sx={{ width: 100 }}
            InputProps={{
              endAdornment: minViews !== '' && (
                <IconButton size="small" onClick={() => setMinViews('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )
            }}
          />
          
          <TextField
            size="small"
            label="Max Views"
            type="number"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            sx={{ width: 100 }}
            InputProps={{
              endAdornment: maxViews !== '' && (
                <IconButton size="small" onClick={() => setMaxViews('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )
            }}
          />
          
          {(utmSource || minViews || maxViews) && (
            <Button 
              size="small" 
              variant="outlined" 
              onClick={resetFilters}
              startIcon={<ClearIcon />}
            >
              Reset
            </Button>
          )}
        </Box>
        <LoadingErrorRQ q={sessions} />
        {sessions.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dates</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Device / OS</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>UTM Source</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.data.map((row) => (
                  <TableRow key={row.sessionId}>
                    <TableCell>
                      <Tooltip 
                        title={`Created: ${new Date(row.createdAt).toLocaleString()}${row.updatedAt && row.updatedAt !== row.createdAt ? `\nUpdated: ${new Date(row.updatedAt).toLocaleString()}` : ''}`} 
                        arrow
                      >
                        <Box>
                          <DateDisplay date={row.createdAt} showDate="ago" variant="body2" sx={{ display: 'block' }} />
                          {row.updatedAt && row.updatedAt !== row.createdAt && (
                            <DateDisplay date={row.updatedAt} showDate="ago" variant="body2" color="primary.main" sx={{ display: 'block' }} />
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.ip}
                        <Tooltip title={row.ipInfo?.country ? `Location: ${row.ipInfo.city || ''}, ${row.ipInfo.country}` : "Fetch IP location info"}>
                          <IconButton
                            size="small"
                            onClick={() => fetchIpMutation.mutate(row.ip)}
                            disabled={fetchingIps.has(row.ip)}
                          >
                            {fetchingIps.has(row.ip) ? (
                              <CircularProgress size={16} />
                            ) : (
                              <LocationOnIcon fontSize="small" color={row.ipInfo?.country ? "success" : "action"} />
                            )}
                          </IconButton>
                        </Tooltip>
                        {row.ipInfo?.country && (
                          <Tooltip title={`${row.ipInfo.city || ''}, ${row.ipInfo.region || ''}, ${row.ipInfo.country}`}>
                            <Chip
                              size="small"
                              label={row.ipInfo.countryCode || row.ipInfo.country}
                              variant="outlined"
                              color="success"
                            />
                          </Tooltip>
                        )}
                        {row.ipInfo?.error && (
                          <Tooltip title={row.ipInfo.error}>
                            <Chip
                              size="small"
                              label="Error"
                              color="error"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.device || 'Desktop'}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.os}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.pageViews || 0} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {row.utm?.source ? (
                        <Chip size="small" label={row.utm.source} color="secondary" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`/admin/insights/${row.sessionId}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Button 
                          size="small" 
                          variant="contained" 
                          component="span"
                        >
                          View Recording
                        </Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}
