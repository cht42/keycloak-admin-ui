import { Button, Link } from "@mui/material";
import type { NextPage } from "next";
import * as NextLink from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <NextLink.default href="/users">
        <Button>Users</Button>
      </NextLink.default>
      <br />
      <NextLink.default href="/buckets">
        <Button>Buckets</Button>
      </NextLink.default>
    </>
  );
};

export default Home;
