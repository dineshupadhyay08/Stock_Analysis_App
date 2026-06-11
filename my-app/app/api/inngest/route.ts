import { serve } from "inngest/next";
import { inngest } from "@/lib/inngests/client";
import { sendDailyNewsSummary, sendSignUpEmail } from "@/lib/inngests/function";

// console.log("SIGNUP FUNCTION:", sendSignUpEmail);
console.log("DAILY NEWS FUNCTION LOADED");
console.log("SIGNUP:", sendSignUpEmail?.opts?.id);
console.log("DAILY:", sendDailyNewsSummary?.opts?.id);

const handler = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary],
});

export const GET = handler.GET;
export const POST = handler.POST;
export const PUT = handler.PUT;
