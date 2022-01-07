import { useRouter } from "next/router";

const User = () => {
  const router = useRouter();
  const { id } = router.query;

  return <p>id: {id}</p>;
};

User.protected = true;

export default User;
