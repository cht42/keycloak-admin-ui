import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import KcAdminClient from "@keycloak/keycloak-admin-client";
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  Stack,
  Checkbox,
  ListItemText,
  Button,
  Typography,
  ButtonProps,
  IconButton,
} from "@mui/material";
import React from "react";
import { IGroup } from "../../types";
import {
  Add,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Remove,
} from "@mui/icons-material";
import { useMutation } from "react-query";
import { useRouter } from "next/router";

const not = (a: IGroup[], b: IGroup[]) => {
  return a.filter((group) => b.findIndex((gr) => gr.id === group.id) === -1);
};

const User = ({ user, userGroups, groups }: { userGroups: IGroup[]; groups: IGroup[] }) => {
  const router = useRouter();
  const { id } = router.query;

  const left = userGroups;
  const right = not(groups, userGroups);

  const updateGroups = useMutation(
    ({ groupId, action }: { groupId: string; action: string }) =>
      fetch(`/api/users/${id}/groups`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, action }),
      }),
    {
      onSuccess: () => {
        router.replace(router.asPath);
      },
    }
  );

  return (
    <Stack spacing={2} justifyContent="center">
      <Card>
        <CardHeader title="User info" />
        <CardContent>
          <b>Username</b>: {user.username}
          <br />
          <b>Enabled</b>: {user.enabled ? "True" : "False"}
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2}>
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography>User groups</Typography>
            <List>
              {left.map((group) => (
                <ListItem
                  key={group.id}
                  secondaryAction={
                    <IconButton>
                      <Remove />
                    </IconButton>
                  }
                  onClick={() => updateGroups.mutate({ groupId: group.id, action: "leave" })}
                >
                  <ListItemText primary={group.name} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography>Available groups</Typography>
            <List>
              {right.map((group) => (
                <ListItem
                  key={group.id}
                  secondaryAction={
                    <IconButton>
                      <Add />
                    </IconButton>
                  }
                  onClick={() => updateGroups.mutate({ groupId: group.id, action: "join" })}
                >
                  <ListItemText primary={group.name} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const session = await getSession({ req });
  if (!session) return { props: {} };

  const { id } = query;

  const kcAdminClient = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_URL + "/auth",
    realmName: process.env.KEYCLOAK_REALM,
  });
  kcAdminClient.setAccessToken(session.accessToken);

  const user = await kcAdminClient.users.findOne({ id: id });
  const userGroups = await kcAdminClient.users.listGroups({ id: id });
  const groups = await kcAdminClient.groups.find();

  return { props: { user, userGroups, groups } };
};

User.protected = true;

export default User;
