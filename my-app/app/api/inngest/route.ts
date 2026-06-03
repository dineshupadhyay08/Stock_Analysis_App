import { serve } from "inngest/next";
import { inngest } from "@/lib/inngests/client";
import { sendDailyNewsSummary, sendSignUpEmail } from "@/lib/inngests/function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary],
});
