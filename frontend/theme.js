// frontend/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF6B6B", // Example color: Coral from the logo
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#383A49", // Example color: Dark Gray from the logo
      contrastText: "#FFFFFF",
    },
    // You can add more color variations as needed, e.g., light, dark, contrastText
  },
  // You can also customize typography, spacing, and other theme options here

  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
  },
});

export default theme;
