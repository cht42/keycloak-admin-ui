import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import KcAdminClient from "@keycloak/keycloak-admin-client";
import { Card, CardContent, CardHeader, List, ListItem, Stack } from "@mui/material";

const User = ({ user, groups }) => {
  return (
    <Stack spacing={2}>
      <Card>
        <CardHeader title="User Info" />
        <CardContent>
          <b>Username</b>: {user.username}
          <br />
          <b>Enabled</b>: {user.enabled ? "True" : "False"}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Groups" />
        <CardContent>
          <List>
            {groups.map((group) => (
              <ListItem key={group.id}>{group.name}</ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Minio rights" />
        <CardContent>
          <List>
            {user.attributes.policy[0].split(",").map((policy, idx) => (
              <ListItem key={idx}>{policy}</ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
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
  const groups = await kcAdminClient.users.listGroups({ id: id });

  return { props: { user, groups } };
};

User.protected = true;

export default User;
