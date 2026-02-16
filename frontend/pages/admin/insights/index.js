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
  Box
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import { useRouter } from "next/router";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";

export default function AdminInsightsIndex() {
  const router = useRouter();
  const sessions = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: () => ApiService.call("/api/admin/insights/sessions"),
  });

  return (
    <AdminLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" mb={3}>
          User Sessions & Insights
        </Typography>
        <LoadingErrorRQ q={sessions} />
        {sessions.data && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Session ID</TableCell>
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
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {row.sessionId}
                      </Typography>
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
                      <Button 
                        size="small" 
                        variant="contained" 
                        onClick={() => router.push(`/admin/insights/${row.sessionId}`)}
                      >
                        View Recording
                      </Button>
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
