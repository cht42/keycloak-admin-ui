import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";
import { Issuer } from "openid-client";

const refreshToken = async (token: JWT) => {
  try {
    const keycloakIssuer = await Issuer.discover(
      process.env.KEYCLOAK_URL + "/auth/realms/" + process.env.KEYCLOAK_REALM
    );

    const client = new keycloakIssuer.Client({
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    });

    const tokenSet = await client.refresh(token.refreshToken);

    return {
      ...token,
      accessToken: tokenSet.access_token,
      accessTokenExpires: tokenSet.expires_at,
      refreshToken: tokenSet.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.log(error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
};

export default NextAuth({
  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_URL + "/auth/realms/" + process.env.KEYCLOAK_REALM,
    }),
  ],
  events: {
    async signOut({ token }) {
      await fetch(
        process.env.KEYCLOAK_URL +
          "/auth/realms/" +
          process.env.KEYCLOAK_REALM +
          "/protocol/openid-connect/logout",
        {
          method: "POST",
          body: new URLSearchParams({
            client_id: process.env.KEYCLOAK_CLIENT_ID,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
            refresh_token: token.refreshToken,
          }),
        }
      );
    },
  },
  callbacks: {
    async jwt({ account, token, user }) {
      if (account)
        return {
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at,
          refreshToken: account.refresh_token,
          user,
        };

      if (Date.now() < token.accessTokenExpires) return token;

      return refreshToken(token);
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
});
