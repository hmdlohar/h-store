import "@/styles/globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/700.css";

import { useEffect } from "react";
import { Router, useRouter } from "next/router";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/common/ReactQueryClient";
import TawkChatWidget from "../common/TawkChatWidget";
import { checkAuth, useCommonStore } from "@/store/commonStore";

export default function MyApp({ Component, pageProps }) {
  const { user, authToken } = useCommonStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [authToken]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        loaded: (posthog) => {
          console.log("posthog loaded");
        },
        debug: false,
      });
      if (user) {
        posthog.identify(user._id, {
          username: user.username,
          mobile: user.mobile,
          email: user.email,
        });
      }
    }
  }, [user]);

  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
          {process.env.NODE_ENV === "production" &&
            !router?.pathname?.includes("admin") && (
              <TawkChatWidget />
            )}
        </ThemeProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
