import NextAuth, { Account, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
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
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }: {
            token: JWT,
            account: Account | null
        }) {
            if (account) {
                token.accessToken = account.access_token;
                token.name = account.providerAccountId;
            }
            return token;
        },
        async session({ session, token }: {
            session: Session,
            token: JWT
        }) {
            session.user = {
                ...session.user,
                name: token.name ?? "",
            };
            return session;
        },
    },
    debug: true,
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
