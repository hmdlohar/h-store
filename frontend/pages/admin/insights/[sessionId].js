import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "@/layout/admin/AdminLayout";
import { 
  Typography, 
  Paper, 
  Box, 
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Stack
} from "@mui/material";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// CRITICAL: Import the rrweb-player styles
import "rrweb-player/dist/style.css";

export default function SessionDetail() {
  const router = useRouter();
  const { sessionId } = router.query;
  const playerRef = useRef(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [playerInstance, setPlayerInstance] = useState(null);

  const sessionData = useQuery({
    queryKey: ["admin-session", sessionId],
    queryFn: () => ApiService.call(`/api/admin/insights/session/${sessionId}`),
    enabled: !!sessionId,
  });

  const recordingData = useQuery({
    queryKey: ["admin-recording", sessionId],
    queryFn: () => ApiService.call(`/api/admin/insights/recording/${sessionId}`),
    enabled: !!sessionId,
  });

  const handleLoadPlayer = async () => {
    if (!recordingData.data?.length || playerInstance) return;
    
    try {
      const RRwebPlayer = (await import("rrweb-player")).default;
      setPlayerLoaded(true);

      // Delay to ensure the container is rendered and has dimensions
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.innerHTML = "";
          
          // Get container dimensions
          const containerWidth = playerRef.current.offsetWidth || 800;
          
          const player = new RRwebPlayer({
            target: playerRef.current,
            props: {
              events: recordingData.data,
              width: containerWidth,
              height: 600,
              autoPlay: true,
            },
          });
          setPlayerInstance(player);
        }
      }, 150);
    } catch (e) {
      console.error("Failed to init player", e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) playerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Stack>
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: -0.5 }}>Session Insights</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', bgcolor: '#f0f0f0', px: 1, py: 0.2, borderRadius: 1 }}>
              ID: {sessionId}
            </Typography>
          </Stack>
          <Button onClick={() => router.back()} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>Back to List</Button>
        </Box>

        {/* Top: Player Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 1.5, 
            minHeight: 500, 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: '#fcfcfc', 
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #eee',
            mb: 4,
            position: 'relative'
          }} 
        >
          {!playerLoaded ? (
            <Box 
              sx={{ 
                flexGrow: 1,
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: 500,
                background: '#f8f9fa'
              }}
            >
              <Button 
                variant="contained" 
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleLoadPlayer}
                disabled={!recordingData.data?.length || recordingData.isLoading}
                sx={{ 
                  borderRadius: 100, 
                  px: 5, py: 2,
                  bgcolor: 'primary.main',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 10px 30px rgba(25, 118, 210, 0.2)',
                  '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.02)' },
                  transition: 'all 0.2s'
                }}
              >
                {recordingData.isLoading ? "Loading Tracking Data..." : "Play Recording"}
              </Button>
              <Typography color="text.secondary" mt={3} variant="body2">
                {!recordingData.data?.length && !recordingData.isLoading 
                  ? "No recordings available for this session" 
                  : "Click to load high-fidelity session replay"}
              </Typography>
            </Box>
          ) : (
            <Box 
              ref={playerRef} 
              sx={{ 
                flexGrow: 1, 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '& .rr-player': { 
                  margin: 'auto',
                  bgcolor: '#fff',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  border: '1px solid #eee'
                } 
              }} 
            />
          )}
          <LoadingErrorRQ q={recordingData} />
        </Paper>

        {/* Bottom: Info & Events Section */}
        <Grid container spacing={3}>
          {/* Metadata */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid #eee', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={3}>Visitor Identity</Typography>
                <LoadingErrorRQ q={sessionData} />
                {sessionData.data?.session && (
                  <Stack spacing={2.5}>
                    <DetailItem label="IP ADDRESS" value={sessionData.data.session.ip} />
                    <DetailItem label="SCREEN SIZE" value={sessionData.data.session.screenWidth ? `${sessionData.data.session.screenWidth} x ${sessionData.data.session.screenHeight}` : 'Unknown'} />
                    <DetailItem label="PLATFORM" value={sessionData.data.session.os || 'Universal'} />
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 700, display: 'block', mb: 1 }}>SYSTEM FINGERPRINT</Typography>
                      <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block', bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2, color: 'text.secondary', border: '1px solid #eee' }}>
                        {sessionData.data.session.userAgent}
                      </Typography>
                    </Box>
                    
                    {sessionData.data.session.utm && Object.values(sessionData.data.session.utm).some(v => !!v) && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 700, display: 'block', mb: 1 }}>ACQUISITION</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(sessionData.data.session.utm).map(([k, v]) => v ? (
                            <Chip size="small" key={k} label={`${k}: ${v}`} variant="outlined" sx={{ borderRadius: 1.5, fontSize: '0.7rem' }} />
                          ) : null)}
                        </Box>
                      </Box>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Timeline */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', minHeight: 400, border: '1px solid #eee' }}>
              <Typography variant="subtitle1" fontWeight={700} mb={3}>Navigation History</Typography>
              <List sx={{ pt: 0 }}>
                {sessionData.data?.events?.map((ev, idx) => (
                  <React.Fragment key={ev._id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <Box sx={{ minWidth: 100, pr: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </Typography>
                      </Box>
                      <Box sx={{ mr: 2 }}>
                        <Chip 
                          label={ev.type.toUpperCase()} 
                          size="small" 
                          variant="filled"
                          sx={{ 
                            fontSize: '0.6rem', 
                            height: 20, 
                            fontWeight: 800,
                            bgcolor: ev.type === 'pageview' ? '#e3f2fd' : '#f3e5f5',
                            color: ev.type === 'pageview' ? '#1976d2' : '#7b1fa2'
                          }}
                        />
                      </Box>
                      <ListItemText 
                        primary={<Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>{ev.path}</Typography>}
                        secondary={ev.data?.title || ""}
                      />
                    </ListItem>
                    {idx < sessionData.data.events.length - 1 && <Divider component="li" sx={{ borderStyle: 'dashed' }} />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <style jsx global>{`
        .rr-player {
          background: #fff !important;
          border-radius: 8px;
        }
        .rr-controller {
          background: #f8f9fa !important;
          border-top: 1px solid #eee;
          padding: 8px !important;
        }
        .rr-timeline {
          background: #eee !important;
        }
        .rr-player-button svg {
            fill: #333 !important;
        }
        .rr-progress {
          background: #ddd !important;
        }
      `}</style>
    </AdminLayout>
  );
}

function DetailItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1, fontWeight: 700, mb: 0.5 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary">{value || 'N/A'}</Typography>
    </Box>
  );
}
