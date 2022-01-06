import KcAdminClient from "@keycloak/keycloak-admin-client";

import { getSession } from "next-auth/react";
import { useMutation } from "react-query";

import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import {
  Box,
  MenuItem,
  Stack,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

interface IUser {
  username: string;
  policy: string;
  password?: string;
}

const Users = ({ users }: { users: any[] }) => {
  const router = useRouter();
  const { control, handleSubmit, reset } = useForm();

  const data: IUser[] = users.map((user) => ({
    username: user.username,
    policy: user.attributes?.policy || "-",
    id: user.id,
  }));

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

  const columns = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "policy", headerName: "Minio policy", flex: 1 },
  ];

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
          <Controller
            name="policy"
            control={control}
            rules={{ required: true }}
            defaultValue={[]}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Minio policy</InputLabel>
                <Select {...field} multiple label="Minio policy">
                  <MenuItem value="readonly">readonly</MenuItem>
                  <MenuItem value="writeonly">writeonly</MenuItem>
                  <MenuItem value="readwrite">readwrite</MenuItem>
                  <MenuItem value="minioUser">minioUser</MenuItem>
                  <MenuItem value="minioSuperuser">minioSuperuser</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Button fullWidth type="submit">
            Add user
          </Button>
        </Stack>
      </Box>
      <DataGrid rows={data} columns={columns} autoHeight />
    </Stack>
  );
};

export async function getServerSideProps({ req }) {
  const session = await getSession({ req });
  const kcAdminClient = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_URL + "/auth",
    realmName: process.env.KEYCLOAK_REALM,
  });
  kcAdminClient.setAccessToken(session.accessToken);

  const users = await kcAdminClient.users.find();

  return { props: { users } };
}

Users.protected = true;

export default Users;
