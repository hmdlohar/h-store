import "@/styles/globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/700.css";

import { useEffect } from "react";
import { Router, useRouter } from "next/router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/common/ReactQueryClient";
// import TawkChatWidget from "../common/TawkChatWidget";
import { checkAuth, useCommonStore } from "@/store/commonStore";

export default function MyApp({ Component, pageProps }) {
  const { user, authToken } = useCommonStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [authToken]);

  return (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
          {/* TawkChatWidget commented out
          {process.env.NODE_ENV === "production" &&
            !router?.pathname?.includes("admin") && (
              <TawkChatWidget />
            )} */}
        </ThemeProvider>
      </QueryClientProvider>
  );
}
