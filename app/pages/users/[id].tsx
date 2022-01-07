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
} from "@mui/material";
import React from "react";
import { IGroup } from "../../types";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";
import { useMutation } from "react-query";
import { useRouter } from "next/router";

const not = (a: IGroup[], b: IGroup[]) => {
  return a.filter((group) => b.findIndex((gr) => gr.id === group.id) === -1);
};

const intersection = (a: IGroup[], b: IGroup[]) => {
  return a.filter((group) => b.findIndex((gr) => gr.id === group.id) !== -1);
};

const buttonProps: ButtonProps = { variant: "outlined", size: "small" };

const User = ({ user, userGroups, groups }: { userGroups: IGroup[]; groups: IGroup[] }) => {
  const router = useRouter();
  const { id } = router.query;

  const [checked, setChecked] = React.useState<IGroup[]>([]);
  const [left, setLeft] = React.useState(userGroups);
  const [right, setRight] = React.useState(not(groups, userGroups));

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (group: IGroup) => () => {
    const currentIndex = checked.indexOf(group);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(group);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const customList = (groups: IGroup[]) => (
    <List>
      {groups.map((group) => {
        return (
          <ListItem key={group.id} button onClick={handleToggle(group)}>
            <ListItemIcon>
              <Checkbox checked={checked.indexOf(group) !== -1} />
            </ListItemIcon>
            <ListItemText primary={group.name} />
          </ListItem>
        );
      })}
    </List>
  );

  const updateGroups = useMutation(
    (newGroups: IGroup[]) =>
      fetch(`/api/users/${id}/groups`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroups),
      }),
    { onSuccess: () => console.log("success") }
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
            {customList(left)}
          </CardContent>
        </Card>
        <Stack spacing={1}>
          <Button {...buttonProps} onClick={handleAllRight} disabled={left.length === 0}>
            <KeyboardDoubleArrowRight />
          </Button>
          <Button {...buttonProps} onClick={handleCheckedRight} disabled={leftChecked.length === 0}>
            <KeyboardArrowRight />
          </Button>
          <Button {...buttonProps} onClick={handleCheckedLeft} disabled={rightChecked.length === 0}>
            <KeyboardArrowLeft />
          </Button>
          <Button {...buttonProps} onClick={handleAllLeft} disabled={right.length === 0}>
            <KeyboardDoubleArrowLeft />
          </Button>
        </Stack>
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography>Available groups</Typography>
            {customList(right)}
          </CardContent>
        </Card>
      </Stack>

      <Button variant="contained" sx={{ width: 100 }} onClick={() => updateGroups.mutate(left)}>
        Save
      </Button>
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
