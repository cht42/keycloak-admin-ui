import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Link href="/users">Users</Link>
    </>
  );
};

export default Home;
