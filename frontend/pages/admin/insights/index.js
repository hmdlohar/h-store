import React from "react";
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
  Autocomplete
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";

import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import DateDisplay from "@/components/common/DateDisplay";
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
                    <TableCell>{row.ip}</TableCell>
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
    </AdminLayout>
  );
}
