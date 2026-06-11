import { serve } from "inngest/next";
import { inngest } from "@/lib/inngests/client";
import { sendSignUpEmail, sendDailyNewsSummary } from "@/lib/inngests/function";

// console.log("INNGEST ROUTE LOADED");
console.log("DAILY NEWS FUNCTION LOADED");
console.log("SIGNUP:", sendSignUpEmail?.opts?.id);
console.log("DAILY:", sendDailyNewsSummary?.opts?.id);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary],
});
