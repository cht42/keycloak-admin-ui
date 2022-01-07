import { Button, Stack, TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { IBucket } from "../types";

const Buckets = ({ buckets }: { buckets: IBucket[] }) => {
  const router = useRouter();
  const { control, handleSubmit, reset } = useForm();

  const createBucket = useMutation(
    (name: string) =>
      fetch("/api/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      }),
    {
      onSuccess: () => {
        reset();
        router.replace(router.asPath);
      },
    }
  );

  const onSubmit = (data: { name: string }) => createBucket.mutate(data.name);

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "creationDate", headerName: "Creation date", flex: 1 },
  ];

  return (
    <Stack spacing={2}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" spacing={2}>
          <Controller
            name="name"
            control={control}
            rules={{ required: true, minLength: 5, maxLength: 15 }}
            defaultValue={""}
            render={({ field }) => <TextField label="Bucket name" {...field} />}
          />

          <Button type="submit">Add bucket</Button>
        </Stack>
      </Box>
      <DataGrid rows={buckets} columns={columns} autoHeight getRowId={(row) => row.name} />
    </Stack>
  );
};

export async function getServerSideProps({ req }) {
  const session = await getSession({ req });
  if (!session) return { props: {} };

  const webId = await fetch(
    `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}?` +
      new URLSearchParams({
        Action: "AssumeRoleWithWebIdentity",
        WebIdentityToken: session?.accessToken,
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
  let buckets = await minioClient.listBuckets();

  return {
    props: {
      buckets: buckets.map((bucket) => ({
        name: bucket.name,
        creationDate: bucket.creationDate.toISOString(),
      })),
    },
  };
}

Buckets.protected = true;

export default Buckets;
