import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import KcAdminClient from "@keycloak/keycloak-admin-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  switch (method) {
    case "POST":
      console.log(body);
      const session = await getSession({ req });
      const kcAdminClient = new KcAdminClient({
        baseUrl: process.env.KEYCLOAK_URL + "/auth",
        realmName: process.env.KEYCLOAK_REALM,
      });
      kcAdminClient.setAccessToken(session.accessToken);

      const resp = await kcAdminClient.users.create({
        username: body.username,
        attributes: {
          policy: body.policy.join(","),
        },
        credentials: [
          {
            type: "password",
            value: body.password,
            temporary: true,
          },
        ],
      });

      res.status(200).json(resp);
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
