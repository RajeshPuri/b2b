import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "./auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@business.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await new Promise((resolve, reject) => {
          verifyUser(credentials.email, credentials.password, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          role: user.role,
          businessId: user.businessId,
          businessName: user.businessName,
          businessType: user.businessType,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.status = user.status;
        token.role = user.role;
        token.businessId = user.businessId;
        token.businessName = user.businessName;
        token.businessType = user.businessType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          status: token.status,
          role: token.role,
          businessId: token.businessId,
          businessName: token.businessName,
          businessType: token.businessType,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
