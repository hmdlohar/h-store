import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function MessageTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const isHtmlTemplate = (fileName = "") => fileName.toLowerCase().endsWith(".html");

  const q = useQuery({
    queryKey: ["admin-message-templates-readonly"],
    queryFn: async () => {
      return await ApiService.call("/api/admin/message-templates", "get");
    },
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Message Templates</Typography>
      </Stack>

      <LoadingErrorRQ q={q} />

      {q.data && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Variables</TableCell>
                <TableCell>Content Preview</TableCell>
                <TableCell align="right">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {q.data.templates?.map((template) => (
                <TableRow key={template.name} hover>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.file || "-"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {(template.variables || []).length ? (
                        template.variables.map((v) => (
                          <Chip key={v} size="small" label={v} variant="outlined" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {template.content ? (
                      isHtmlTemplate(template.file) ? (
                        <Paper
                          variant="outlined"
                          sx={{ p: 1, maxHeight: 110, overflow: "hidden", backgroundColor: "#fafafa" }}
                        >
                          <Box
                            sx={{ fontSize: 12 }}
                            dangerouslySetInnerHTML={{ __html: template.content }}
                          />
                        </Paper>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {template.content.substring(0, 80)}...
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                    {template.loadError ? (
                      <Typography variant="caption" color="error">
                        {template.loadError}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => setSelectedTemplate(template)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {q.data.templates?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No templates configured in templateRegistry.js
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={Boolean(selectedTemplate)}
        onClose={() => setSelectedTemplate(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selectedTemplate?.name || "Template"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2">
              <strong>File:</strong> {selectedTemplate?.file || "-"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography variant="body2"><strong>Variables:</strong></Typography>
              {(selectedTemplate?.variables || []).length ? (
                selectedTemplate.variables.map((v) => (
                  <Chip key={v} size="small" label={v} variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">None</Typography>
              )}
            </Stack>
            {selectedTemplate?.loadError ? (
              <Typography variant="body2" color="error">
                {selectedTemplate.loadError}
              </Typography>
            ) : null}
            <Paper variant="outlined" sx={{ p: 2, overflowX: "auto" }}>
              {isHtmlTemplate(selectedTemplate?.file) ? (
                <Box dangerouslySetInnerHTML={{ __html: selectedTemplate?.content || "" }} />
              ) : (
                <Box sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                  {selectedTemplate?.content || ""}
                </Box>
              )}
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTemplate(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
