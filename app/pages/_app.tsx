import type { AppProps } from "next/app";

import { SessionProvider, signIn, useSession } from "next-auth/react";

import { GeistProvider, CssBaseline, Page, Loading } from "@geist-ui/react";
import { Header } from "../components/Header";
import { useEffect } from "react";
import { NextPage } from "next";
import { QueryClient, QueryClientProvider } from "react-query";

export type NextApplicationPage<P = any, IP = P> = NextPage<P, IP> & {
  protected?: boolean;
};

const queryClient = new QueryClient();

const MyApp = (props: AppProps) => {
  const {
    Component,
    pageProps: { session, ...pageProps },
  }: {
    Component: NextApplicationPage;
    pageProps: any;
  } = props;

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <GeistProvider themeType="light">
          <CssBaseline />
          <Page>
            <Header />
            <Page.Body>
              {Component.protected ? (
                <Protected>
                  <Component {...pageProps} />
                </Protected>
              ) : (
                <Component {...pageProps} />
              )}
            </Page.Body>
          </Page>
        </GeistProvider>
      </SessionProvider>
    </QueryClientProvider>
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

  return <Loading />;
};

export default MyApp;
