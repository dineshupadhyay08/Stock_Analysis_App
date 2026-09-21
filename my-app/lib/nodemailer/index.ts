import nodemailer from "nodemailer";
import {
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  PASSWORD_RESET_EMAIL_TEMPLATE,
} from "../nodemailer/templates";


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro,
  );

  const mailOptions = {
    from: `"Signalist" <signalist@dinesh.pro>`,
    to: email,
    subject: `Welcome to Signalist - your stock market toolkit is ready!`,
    text: "Thanks for joining Signalist",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    date,
  ).replace("{{newsContent}}", newsContent);

  const mailOptions = {
    from: `"Signalist News" <signalist@dinesh.pro>`,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Signalist`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};


export const sendPasswordResetEmail = async ({
  email,
  name,
  code,
  expiresInMinutes = 10,
}: {
  email: string;
  name: string;
  code: string;
  expiresInMinutes?: number;
}): Promise<void> => {
  const htmlTemplate = PASSWORD_RESET_EMAIL_TEMPLATE
    .replace("{{name}}", name || "Investor")
    .replace("{{code}}", code)
    .replace("{{expiresInMinutes}}", String(expiresInMinutes));

  const mailOptions = {
    from: `"Signalist Security" <signalist@dinesh.pro>`,
    to: email,
    subject: `🔐 Reset Your Signalist Password (Code: ${code})`,
    text: `Your Signalist password reset verification code is ${code}. It will expire in ${expiresInMinutes} minutes.`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
