"use server";

import { getAuth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngests/client";
import { headers } from "next/headers";

let __signupInvocationCounter = 0;
function __maskEmail(e: string){
  return e.replace(/(.{3}).+(.{3}@.+)/, '$1***$2');
}
export const signUpWithEmail = async ({
  email,
  password,
  fullName,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData) => {
  const __invocationId = ++__signupInvocationCounter;
  const fs = require('fs');
  const path = require('path');
  const __logPath = path.join(__dirname, '../../tmp/signup_debug.log');
  const __logEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    invocationId: __invocationId,
    email: __maskEmail(email),
    name: fullName,
  }) + '\n';
  try { fs.appendFileSync(__logPath, __logEntry); } catch(e) { console.error('Log write error', e); }

  try {
    const auth = await getAuth();
    const response = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });

    // Inngest event – do not let its failure affect the signup result
    try {
      console.log("🔥 BEFORE INNGEST SEND");
      const result = await inngest.send({
        name: "app/user.created",
        data: {
          email,
          name: fullName,
          country,
          investmentGoals,
          riskTolerance,
          preferredIndustry,
        },
      });
      console.log("✅ INNGEST RESULT:", result);
    } catch (ingestErr) {
      console.error("Inngest user.created event failed:", ingestErr);
    }

    return { success: true, data: response };
  } catch (e) {
    // Extract Better Auth error details if available
    let errorMessage = "Sign up failed";
    if (e instanceof Error) {
      const msg = e.message;
      if (msg.includes("USER_ALREADY_EXISTS")) {
        errorMessage = "A user with this email already exists. Please use a different email.";
      } else if (msg.toLowerCase().includes("invalid")) {
        errorMessage = "Invalid signup data. Please check your inputs.";
      } else {
        errorMessage = msg;
      }
    }
    console.log("Sign up failed", e);
    return { success: false, error: errorMessage };
  }
};



export const signInWithEmail = async ({ email, password }: SignInFormData) => {
  try {
    const auth = await getAuth();
    const response = await auth.api.signInEmail({ body: { email, password } });

    return { success: true, data: response };
  } catch (e) {
    console.error("Sign in failed:", e);

    // Extract Better Auth error message if available
    let errorMessage = "Invalid email or password. Please check your credentials and try again.";

    if (e instanceof Error) {
      const errorStr = e.message.toLowerCase();
      // Better Auth returns specific error messages we can check for
      if (errorStr.includes("invalid") || errorStr.includes("credential") || errorStr.includes("password") || errorStr.includes("user")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (errorStr.includes("network") || errorStr.includes("timeout")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        // For any other error, show generic message but log the real error
        errorMessage = "Something went wrong. Please try again.";
      }
    }

    return { success: false, error: errorMessage };
  }
};

export const signOut = async () => {
  try {
    const auth = await getAuth();
    await auth.api.signOut({ headers: await headers() });
  } catch (e) {
    console.log("Sign out failed", e);
    return { success: false, error: "Sign out failed" };
  }
};
