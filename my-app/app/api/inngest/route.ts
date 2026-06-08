import { serve } from "inngest/next";
import { inngest } from "@/lib/inngests/client";
import { sendSignUpEmail } from "@/lib/inngests/function";

console.log("SIGNUP FUNCTION:", sendSignUpEmail);

const handler = serve({
  client: inngest,
  functions: [sendSignUpEmail],
});

export const GET = handler.GET;
export const POST = handler.POST;
export const PUT = handler.PUT;
