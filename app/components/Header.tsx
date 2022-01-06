import { Login, Logout } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { AppBar, Button, Stack, Toolbar, Typography } from "@mui/material";

import { signIn, signOut, useSession } from "next-auth/react";

import { NextLinkComposed } from "../src/Link";

export const Header = () => {
  const { status } = useSession();

  return (
    <AppBar position="static">
      <Toolbar>
        <Stack
          direction="row"
          sx={{ width: "100%" }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Button component={NextLinkComposed} to="/">
            Home
          </Button>
          <Typography>Admin panel</Typography>
          {(() => {
            switch (status) {
              case "loading":
                return <LoadingButton loading>Loading</LoadingButton>;
              case "authenticated":
                return (
                  <Button startIcon={<Logout />} onClick={() => signOut({ callbackUrl: "/" })}>
                    Sign Out
                  </Button>
                );
              case "unauthenticated":
                return (
                  <Button startIcon={<Login />} onClick={() => signIn()}>
                    Sign In
                  </Button>
                );
            }
          })()}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
