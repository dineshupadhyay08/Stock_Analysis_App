import { serve } from "inngest/next";
import { inngest } from "@/lib/inngests/client";
import { sendSignUpEmail, sendDailyNewsSummary } from "@/lib/inngests/function";

console.log("INNGEST ROUTE LOADED");

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary],
});
