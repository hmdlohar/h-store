import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function OrderStepWrapper({
  title,
  children,
  onBack,
  onContinue,
  continueDisabled = false,
  continueLoading = false,
  showBack = true,
  backText = "Back",
  continueText = "Continue",
  showContinue = true,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 200px)",
      }}
    >
      {/* Fake Box */}
      <Box sx={{ height: 10 }} />
      <Box mb={1}>
        <Typography variant="h6" fontWeight={600} textAlign="center">
          {title}
        </Typography>
      </Box>

      <Box flex={1}>{children}</Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          p: { xs: 1, sm: 1.25 },
          display: "flex",
          gap: 1,
          flexWrap: "nowrap",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          zIndex: 1000,
          pb: {
            xs: "calc(6px + env(safe-area-inset-bottom, 0px))",
            sm: "calc(6px + env(safe-area-inset-bottom, 0px))",
          },
        }}
      >
        {showBack && (
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={continueLoading}
            sx={{
              py: 1.1,
              px: 2,
              borderRadius: "100px",
              fontWeight: 600,
              flex: 1,
            }}
          >
            {backText}
          </Button>
        )}
        {showContinue && onContinue && (
          <Button
            variant="contained"
            onClick={onContinue}
            disabled={continueDisabled || continueLoading}
            sx={{
              py: 1.1,
              px: 2,
              borderRadius: "100px",
              fontWeight: 700,
              flex: 1.4,
              bgcolor: "#FFD814",
              color: "#0F1111",
              border: "1px solid #FCD200",
              boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
              "&:hover": {
                bgcolor: "#F7CA00",
                borderColor: "#F2C200",
              },
              "&:disabled": {
                bgcolor: "#FFD814",
                opacity: 0.6,
              },
            }}
          >
            {continueLoading ? "Loading..." : continueText}
          </Button>
        )}
      </Box>
      {/* Fake Box Bottom */}
      <Box sx={{ height: 60 }} />
    </Box>
  );
}
