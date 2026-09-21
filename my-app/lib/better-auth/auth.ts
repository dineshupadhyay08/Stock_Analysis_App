import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

// Removed authInstance caching to ensure fresh DB connection on each call
export const getAuth = async () => {
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not found");

  // Build Better Auth config, adding Google provider only when both credentials exist
  const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (clientId && clientSecret) {
    socialProviders.google = { clientId: clientId as string, clientSecret: clientSecret as string };
  }

  const auth = betterAuth({
    database: mongodbAdapter(db as any),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true, disableSignUp: false, requireEmailVerification: false, minPasswordLength: 8, maxPasswordLength: 128, autoSignIn: true },
    socialProviders,
    plugins: [nextCookies()],
  });

  return auth;
};

export const auth = await getAuth();