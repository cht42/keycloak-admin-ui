import KcAdminClient from "@keycloak/keycloak-admin-client";

import { getSession } from "next-auth/react";
import { useMutation } from "react-query";

import { Button, Card, Grid, Input, Select, Spacer, Table, Text } from "@geist-ui/react";

import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";

interface IUser {
  username: string;
  policy: string;
  password?: string;
}

const Users = ({ users }: { users: any[] }) => {
  const router = useRouter();
  const { control, handleSubmit, reset } = useForm({});

  const data: IUser[] = users.map((user) => ({
    username: user.username,
    policy: user.attributes?.policy || "-",
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

  return (
    <>
      <Card shadow>
        <Card.Content>
          <Table<IUser> data={data}>
            <Table.Column prop="username" label="Nom" />
            <Table.Column prop="policy" label="Droits minio" />
          </Table>
        </Card.Content>
      </Card>
      <Spacer />
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid.Container gap={4} justify="flex-end">
            <Grid xs={8} direction="column">
              <Text small type="secondary">
                Nom d&apos;utilisateur
              </Text>
              <Controller
                name="username"
                control={control}
                rules={{ required: true, minLength: 5, maxLength: 15 }}
                defaultValue={""}
                render={({ field }) => <Input {...field} />}
              />
            </Grid>
            <Grid xs={8} direction="column">
              <Text small type="secondary">
                Mot de passe temporaire
              </Text>
              <Controller
                name="password"
                control={control}
                defaultValue={""}
                rules={{ required: true, minLength: 8, maxLength: 30 }}
                render={({ field }) => <Input.Password {...field} />}
              />
            </Grid>
            <Grid xs={8} direction="column">
              <Text small type="secondary">
                Droits Minio
              </Text>
              <Controller
                name="policy"
                control={control}
                rules={{ required: true }}
                defaultValue={[]}
                render={({ field }) => (
                  <>
                    <Select {...field} multiple>
                      <Select.Option value="readonly">readonly</Select.Option>
                      <Select.Option value="writeonly">writeonly</Select.Option>
                      <Select.Option value="readwrite">readwrite</Select.Option>
                      <Select.Option value="minioUser">minioUser</Select.Option>
                      <Select.Option value="minioSuperuser">minioSuperuser</Select.Option>
                    </Select>
                  </>
                )}
              />
            </Grid>
            <Grid xs={8}>
              <Button
                htmlType="submit"
                onClick={(e) => e.persist()}
                auto
                type="secondary"
                // onClick={() =>
                //
                // }
              >
                Create User
              </Button>
            </Grid>
          </Grid.Container>
        </form>
      </Card>
    </>
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
