import { Button, Stack, TextField, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Controller, useForm } from "react-hook-form";

interface IBucket {
  name: string;
  creationDate: string;
}

const Buckets = ({ buckets }: { buckets: IBucket[] }) => {
  const { control, handleSubmit, reset } = useForm();

  const onSubmit = (data: { name: string }) => console.log(data);

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
  const Minio = require("minio");
  const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
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
