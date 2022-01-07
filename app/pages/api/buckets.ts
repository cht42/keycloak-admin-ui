import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;
  const session = await getSession({ req });
  if (!session) {
    res.status(401).send("Unauthorized");
    return;
  }

  switch (method) {
    case "POST":
      console.log(body);

      const webId = await fetch(
        `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}?` +
          new URLSearchParams({
            Action: "AssumeRoleWithWebIdentity",
            WebIdentityToken: session.accessToken,
            Version: "2011-06-15",
            DurationSeconds: "604800",
          }),
        { method: "POST" }
      );

      const parseString = require("xml2js").parseString;
      let data = null;
      parseString(await webId.text(), { explicitArray: false }, (err, result) => (data = result));
      const credentials =
        data.AssumeRoleWithWebIdentityResponse.AssumeRoleWithWebIdentityResult.Credentials;

      const Minio = require("minio");
      const minioClient = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: parseInt(process.env.MINIO_PORT),
        useSSL: false,
        accessKey: credentials.AccessKeyId,
        secretKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken,
      });
      minioClient.makeBucket(body.name);
      res.status(200).end();
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
