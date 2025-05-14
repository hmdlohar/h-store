import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
  CS_AVAILABLE_TIME,
  LEGAL_NAME,
  LEGAL_ADDRESS,
  GST_NUMBER,
} from "@/constants";
import MainLayout from "@/layout/MainLayout";
import EcomHead from "@/common/EcomHead";

export default function Contact() {
  const handleChatClick = () => {
    if (window.Tawk_API) {
      window.Tawk_API.maximize();
    }
  };

  return (
    <MainLayout>
      <EcomHead title="Contact Us" />
      <Container maxWidth="lg" sx={{ py: 1 }}>
        <Box textAlign="center" mb={2}>
          <Typography variant="h2" component="h1" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            We're here to help with any questions you might have.
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            How can we help you?
          </Typography>
          <Typography paragraph>
            Our team is available Monday-Friday, {CS_AVAILABLE_TIME.FROM} -{" "}
            {CS_AVAILABLE_TIME.TO}. The fastest way to reach us is through our
            chat system.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ChatIcon />}
            onClick={handleChatClick}
            sx={{ mt: 2 }}
          >
            Start Chat Now
          </Button>
        </Paper>

        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mt: 8, mb: 4, textAlign: "center" }}
        >
          Other Ways to Reach Us
        </Typography>

        <Grid container spacing={4}>
          <Grid size={12}>
            <Card elevation={2}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 4,
                }}
              >
                <EmailIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Email Us
                </Typography>
                <Typography>{CONTACT_EMAIL}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  We typically respond within 24 hours.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={12}>
            <Card elevation={2}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 4,
                }}
              >
                <PhoneIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Call Us
                </Typography>
                <Typography>{CONTACT_PHONE}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Available weekdays from {CS_AVAILABLE_TIME.FROM} to{" "}
                  {CS_AVAILABLE_TIME.TO}.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mt: 8, mb: 4, textAlign: "center" }}
        >
          Business Information
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="flex-start" mb={2}>
                <BusinessIcon sx={{ mr: 2, color: "primary.main" }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Legal Business Name
                  </Typography>
                  <Typography variant="body1">{LEGAL_NAME}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" mb={2}>
                <LocationOnIcon sx={{ mr: 2, color: "primary.main" }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Registered Address
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                    {LEGAL_ADDRESS}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="flex-start" mb={2}>
                <Box
                  sx={{
                    mr: 2,
                    color: "primary.main",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body1" fontWeight="bold">
                    GST
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    GST Number
                  </Typography>
                  <Typography variant="body1">{GST_NUMBER}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" mb={2}>
                <EmailIcon sx={{ mr: 2, color: "primary.main" }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1">{CONTACT_EMAIL}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </MainLayout>
  );
}
