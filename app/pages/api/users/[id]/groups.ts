import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import KcAdminClient from "@keycloak/keycloak-admin-client";
import { IGroup } from "../../../../types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;
  const session = await getSession({ req });
  if (!session) {
    res.status(401).send("Unauthorized");
    return;
  }
  const { id } = req.query;

  switch (method) {
    case "PUT":
      const kcAdminClient = new KcAdminClient({
        baseUrl: process.env.KEYCLOAK_URL + "/auth",
        realmName: process.env.KEYCLOAK_REALM,
      });
      kcAdminClient.setAccessToken(session.accessToken);
      switch (body.action) {
        case "leave":
          await kcAdminClient.users.delFromGroup({
            groupId: body.groupId,
            id: id,
          });
          break;
        case "join":
          await kcAdminClient.users.addToGroup({
            groupId: body.groupId,
            id: id,
          });
          break;
      }
      res.status(200).end();
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
