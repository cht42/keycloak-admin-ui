import KcAdminClient from "@keycloak/keycloak-admin-client";

import { getSession } from "next-auth/react";
import { useMutation } from "react-query";

import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import {
  Box,
  Stack,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { NextLinkComposed } from "../../src/Link";
import { GetServerSideProps } from "next";
import { IUser } from "../../types";

const Users = ({ users }: { users: IUser[] }) => {
  const router = useRouter();
  const { control, handleSubmit, reset } = useForm();

  const createUser = useMutation(
    (newUser: IUser) =>
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      }),
    {
      onSuccess: () => {
        reset();
        router.replace(router.asPath);
      },
    }
  );

  const onSubmit = (data: IUser) => createUser.mutate(data);

  return (
    <Stack spacing={2}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" spacing={2}>
          <Controller
            name="username"
            control={control}
            rules={{ required: true, minLength: 5, maxLength: 15 }}
            defaultValue={""}
            render={({ field }) => <TextField fullWidth label="Username" {...field} />}
          />
          <Controller
            name="password"
            control={control}
            defaultValue={""}
            rules={{ required: true, minLength: 8, maxLength: 30 }}
            render={({ field }) => (
              <TextField fullWidth label="Temporary password" type="password" {...field} />
            )}
          />
          <Button fullWidth type="submit">
            Add user
          </Button>
        </Stack>
      </Box>
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemButton component={NextLinkComposed} to={`/users/${user.id}`}>
              <ListItemAvatar>
                <Avatar>{user.username?.toUpperCase()[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.username} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  if (!session) return { props: {} };

  const kcAdminClient = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_URL + "/auth",
    realmName: process.env.KEYCLOAK_REALM,
  });
  kcAdminClient.setAccessToken(session.accessToken);

  const users = await kcAdminClient.users.find();

  const data: IUser[] = users.map((user) => ({
    username: user.username,
    id: user.id,
  }));

  return { props: { users: data } };
};

Users.protected = true;

export default Users;
