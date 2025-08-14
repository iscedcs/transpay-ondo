import { decodeJwt } from "jose";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API, URLS } from "./lib/const";

const headers = {
  "api-secret": process.env.API_SECRET || "",
  "Content-Type": "application/json",
};

export default {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const apiRoute = URLS.auth.signin.agent;
        const loginPayload = {
          email: credentials?.email,
          password: credentials?.password,
        };
        const mainUrl = API + apiRoute;
        try {
          const res = await fetch(mainUrl, {
            method: "POST",
            body: JSON.stringify(loginPayload),
            headers,
          });

          const result = await res.json();

          if (!result.success) {
            return null;
          }
          const user = result.user;
          const decoded = decodeJwt(result.jwtToken);

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            access_token: result.jwtToken,
            name: `${user.firstName} ${user.lastName}`,
            token_type: "JWT",
            expires_in: String(decoded.exp),
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
