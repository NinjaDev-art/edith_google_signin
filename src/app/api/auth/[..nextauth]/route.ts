import NextAuth, { Account, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import TwitterProvider from "next-auth/providers/twitter";

declare module "next-auth" {
    interface Session {
        userId: string;
    }
}

export const authOptions = {
    providers: [
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
            version: "2.0",
            authorization: {
                params: {
                    scope: "users.read tweet.read follows.write follows.read",
                    response_type: "code",
                    access_type: "offline",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }: {
            token: JWT,
            account: Account | null
        }) {
            if (account) {
                token.userId = account.providerAccountId;
            }
            return token;
        },
        async session({ session, token }: {
            session: Session,
            token: JWT
        }) {
            session.userId = token.sub ?? "";
            return session;
        },
    },
    debug: true,
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
