import React from "react";
import { Box, Button, useTheme, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";

const AddToCartAction = ({ onClick, disabled, label = "Add To Cart" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        position: {
          xs: "fixed",
          md: "sticky"
        },
        left: { xs: 0, md: 'unset' },
        right: { xs: 0, md: 'unset' },
        bottom: { xs: 0, md: 0 },
        top: { md: '100%' },
        bgcolor: "background.paper",
        boxShadow: { xs: 4, md: 0 },
        zIndex: { xs: 1300, md: 'auto' },
        p: 2,
        display: "flex",
        justifyContent: "center",
        width: { xs: '100%', md: '100%' },
        maxWidth: { xs: '100%', md: 500 },
        mx: { xs: 0, md: 'auto' },
        mb: { xs: 0, md: 3 },
      }}
    >
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </Button>
    </Box>
  );
};

AddToCartAction.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

export default AddToCartAction;
