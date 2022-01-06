declare global {
  namespace NodeJS {
    interface ProcessEnv {
      KEYCLOAK_URL: string;
      KEYCLOAK_REALM: string;
      KEYCLOAK_CLIENT_ID: string;
      KEYCLOAK_CLIENT_SECRET: string;
      MINIO_ENDPOINT: string;
      MINIO_PORT: string;
    }
  }
}

export {};
