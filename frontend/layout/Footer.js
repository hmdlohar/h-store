import { Box, Container, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {"Copyright © "}
          <Link color="inherit" href="/">
            Your E-commerce Site
          </Link>{" "}
          {new Date().getFullYear()}
          {"."}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1, gap: 2 }}>
          <Link href="/about" color="inherit" underline="hover">
            About Us
          </Link>
          <Link href="/contact" color="inherit" underline="hover">
            Contact Us
          </Link>
          <Link href="/privacy" color="inherit" underline="hover">
            Privacy Policy
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
