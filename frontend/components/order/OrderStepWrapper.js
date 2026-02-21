import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useOrderStore } from "@/store/orderStore";

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
  showContinue = true
}) {
  const { step, hasVariants } = useOrderStore();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 'calc(100vh - 200px)',
        pb: '80px'
      }}
    >
      <Box mb={3}>
        <Typography variant="h6" fontWeight={600} textAlign="center" mb={1}>
          {title}
        </Typography>
      </Box>
      
      <Box flex={1}>
        {children}
      </Box>
      
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          gap: 2,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}
      >
        {showBack && (
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={continueLoading}
            sx={{
              py: 1.5,
              px: 3,
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
              py: 1.5,
              px: 4,
              borderRadius: "100px",
              fontWeight: 700,
              flex: 2,
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
              }
            }}
          >
            {continueLoading ? "Loading..." : continueText}
          </Button>
        )}
      </Box>
    </Box>
  );
}
