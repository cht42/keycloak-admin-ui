declare global {
  namespace NodeJS {
    interface ProcessEnv {
      KEYCLOAK_URL: string;
      KEYCLOAK_REALM: string;
      KEYCLOAK_CLIENT_ID: string;
      KEYCLOAK_CLIENT_SECRET: string;
      MINIO_ENDPOINT: string;
      MINIO_PORT: number;
      MINIO_ACCESS_KEY: string;
      MINIO_SECRET_KEY: string;
    }
  }
}

export {};
