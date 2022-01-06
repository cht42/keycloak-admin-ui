import type { AppProps } from "next/app";

import { SessionProvider, signIn, useSession } from "next-auth/react";

import { Header } from "../components/Header";
import { useEffect } from "react";
import { NextPage } from "next";
import { QueryClient, QueryClientProvider } from "react-query";
import { Container, CssBaseline, LinearProgress, ThemeProvider } from "@mui/material";
import createEmotionCache from "../src/createEmotionCache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import theme from "../src/theme";

export type NextApplicationPage<P = any, IP = P> = NextPage<P, IP> & {
  protected?: boolean;
};

const clientSideEmotionCache = createEmotionCache();

const queryClient = new QueryClient();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const MyApp = (props: MyAppProps) => {
  const {
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps: { session, ...pageProps },
  }: {
    Component: NextApplicationPage;
    emotionCache?: EmotionCache;
    pageProps: any;
  } = props;

  return (
    <SessionProvider session={session}>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <CssBaseline />
            <Header />
            <Container sx={{ my: 3 }}>
              {Component.protected ? (
                <Protected>
                  <Component {...pageProps} />
                </Protected>
              ) : (
                <Component {...pageProps} />
              )}
            </Container>
          </QueryClientProvider>
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  );
};

const Protected = ({ children }: { children: JSX.Element }) => {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;

  useEffect(() => {
    if (status === "loading") return;
    if (!isUser) signIn();
  }, [isUser, status]);

  if (isUser) return children;

  return <LinearProgress />;
};

export default MyApp;
