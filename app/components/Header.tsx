import { Button, Grid, Link, Page, Text } from "@geist-ui/react";
import { Home, LogIn, LogOut } from "@geist-ui/react-icons";
import { signIn, signOut, useSession } from "next-auth/react";
import * as NextLink from "next/link";

export const Header = () => {
  const { status } = useSession();

  return (
    <Page.Header>
      <Grid.Container gap={2} alignItems="center" justify="space-between">
        <Grid>
          <NextLink.default href="/">
            <Link>
              <Home />
            </Link>
          </NextLink.default>
        </Grid>
        <Grid>
          <Text h1>Admin panel</Text>
        </Grid>
        <Grid>
          {(() => {
            switch (status) {
              case "loading":
                return <Button loading>Action</Button>;
              case "authenticated":
                return (
                  <Button icon={<LogOut />} onClick={() => signOut()}>
                    Sign Out
                  </Button>
                );
              case "unauthenticated":
                return (
                  <Button icon={<LogIn />} onClick={() => signIn()}>
                    Sign In
                  </Button>
                );
            }
          })()}
        </Grid>
      </Grid.Container>
    </Page.Header>
  );
};
