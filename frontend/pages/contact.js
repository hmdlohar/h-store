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
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import { CONTACT_EMAIL, CONTACT_PHONE, CS_AVAILABLE_TIME } from "@/constants";
import MainLayout from "@/layout/MainLayout";

export default function Contact() {
  const handleChatClick = () => {
    if (window.Tawk_API) {
      window.Tawk_API.maximize();
    }
  };

  return (
    <MainLayout>
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
      </Container>
    </MainLayout>
  );
}
