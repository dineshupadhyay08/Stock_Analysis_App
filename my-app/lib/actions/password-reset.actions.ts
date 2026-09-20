"use server";

import { PasswordReset } from "@/database/models/password-reset.model";
import { sendPasswordResetEmail } from "@/lib/nodemailer";
import { connectToDatabase } from "@/database/mongoose";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import crypto from "crypto";

// Constants
const VERIFICATION_CODE_EXPIRY_MINUTES = 10;
const MAX_RESET_ATTEMPTS = 5;
const RESET_ATTEMPT_WINDOW_MINUTES = 15;

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash a string with SHA256
 */
function hashString(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

/**
 * Initiate password reset - send verification code to email
 * Does NOT reveal whether email exists (account enumeration prevention)
 */
export const initiatePasswordReset = async (email: string) => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in Better Auth's user collection
    // (do not reveal this to the client — account enumeration prevention)
    const user = await db.collection("user").findOne(
      { email: normalizedEmail },
      { projection: { email: 1, name: 1 } }
    );

    // Check rate limiting
    const recentResets = await PasswordReset.countDocuments({
      email: normalizedEmail,
      createdAt: {
        $gte: new Date(Date.now() - RESET_ATTEMPT_WINDOW_MINUTES * 60 * 1000),
      },
    });

    if (recentResets >= MAX_RESET_ATTEMPTS) {
      // Rate limited, but don't reveal it
      return {
        success: true,
        message: "If an account exists with this email, a password reset code has been sent.",
      };
    }

    // If user doesn't exist, still return success (don't leak account existence)
    if (!user) {
      return {
        success: true,
        message: "If an account exists with this email, a password reset code has been sent.",
      };
    }

    // Generate verification code
    const code = generateVerificationCode();
    const codeHash = hashString(code);

    // Delete any existing reset tokens for this email
    await PasswordReset.deleteMany({ email: normalizedEmail });

    // Create new reset token record
    const expiresAt = new Date(
      Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
    );

    await PasswordReset.create({
      email: normalizedEmail,
      codeHash,
      expiresAt,
      attemptCount: 0,
      createdAt: new Date(),
    });

    // Send email with verification code — if this fails, remove the unused record
    try {
      await sendPasswordResetEmail({
        email: normalizedEmail,
        name: (user.name as string) || "Investor",
        code,
        expiresInMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
      });
    } catch (emailError) {
      await PasswordReset.deleteMany({ email: normalizedEmail, codeHash });
      console.error("Password reset email failed:", {
        operation: "sendPasswordResetEmail",
        smtpHost: "gmail",
        code:
          emailError && typeof emailError === "object" && "code" in emailError
            ? String((emailError as { code?: unknown }).code)
            : undefined,
        responseCode:
          emailError &&
          typeof emailError === "object" &&
          "responseCode" in emailError
            ? String((emailError as { responseCode?: unknown }).responseCode)
            : undefined,
      });
      throw emailError;
    }

    return {
      success: true,
      message: "If an account exists with this email, a password reset code has been sent.",
    };
  } catch (error) {
    console.error("Error initiating password reset:", error);
    return {
      success: false,
      error: "An error occurred. Please try again later.",
    };
  }
};

/**
 * Verify the reset code and generate a temporary reset token
 */
export const verifyResetCode = async (email: string, code: string) => {
  try {
    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const codeHash = hashString(code);

    // Find the reset token record
    const resetToken = await PasswordReset.findOne({
      email: normalizedEmail,
      codeHash,
    });

    // Token not found or already used
    if (!resetToken || resetToken.usedAt) {
      return {
        success: false,
        error: "Invalid or expired verification code.",
      };
    }

    // Token expired
    if (resetToken.expiresAt < new Date()) {
      return {
        success: false,
        error: "Verification code has expired. Please request a new one.",
      };
    }

    // Check attempt count
    if (resetToken.attemptCount >= 5) {
      return {
        success: false,
        error: "Too many failed attempts. Please request a new verification code.",
      };
    }

    // Generate a temporary reset token (JWT-like, valid for 15 minutes)
    const resetTokenPayload = `${normalizedEmail}:${Date.now()}:${crypto.randomBytes(32).toString("hex")}`;
const resetTokenHash = hashString(resetTokenPayload);

const resetTokenExpiresAt = new Date(
  Date.now() + 15 * 60 * 1000
);

await PasswordReset.updateOne(
  { _id: resetToken._id },
  {
    $set: {
      resetTokenHash,
      resetTokenExpiresAt,
    },
    $inc: {
      attemptCount: 1,
    },
  }
);

    return {
      success: true,
      message: "Code verified successfully.",
      resetToken: resetTokenPayload, // Send the unhashed token to client (it will send it back in the next request)
    };
  } catch (error) {
    console.error("Error verifying reset code:", error);
    return {
      success: false,
      error: "An error occurred. Please try again later.",
    };
  }
};

/**
 * Reset password using the reset token and new password
 */
export const resetPassword = async (
  email: string,
  resetToken: string,
  newPassword: string
) => {
  try {
    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long.",
      };
    }

    // Hash the reset token to compare
    const resetTokenHash = hashString(resetToken);

    // Find the reset token record with matching hash
    const resetTokenRecord = await PasswordReset.findOne({
      email: normalizedEmail,
      resetTokenHash,
    });

    if (!resetTokenRecord) {
      return {
        success: false,
        error: "Invalid reset token. Please try again.",
      };
    }

    // Check if token has expired (15 minute window from code verification)
    if (
  !resetTokenRecord.resetTokenExpiresAt ||
  resetTokenRecord.resetTokenExpiresAt <= new Date()
) {
  return {
    success: false,
    error: "Reset token has expired. Please request a new verification code.",
  };
}

    // Check if already used
    if (resetTokenRecord.usedAt) {
      return {
        success: false,
        error: "This reset token has already been used.",
      };
    }

    // --- Begin Better Auth password update ---
    try {
      // Get Better Auth instance
      const auth = await getAuth();

      // Find Better Auth user by email (include accounts to ensure existence)
      const baUser = await auth.context.internalAdapter.findUserByEmail(normalizedEmail, { includeAccounts: true });
      if (!baUser?.user) {
        return { success: false, error: "User not found in authentication system." };
      }
      const userId = baUser.user.id;

      // Hash the new password using Better Auth's hashing utility
      const hashedPassword = await auth.context.password.hash(newPassword);

      // Ensure credential account exists; create if missing, otherwise update password
      const existingAccounts = await auth.context.internalAdapter.findAccounts(userId);
      const hasCredential = existingAccounts.some((ac: any) => ac.providerId === "credential");
      if (!hasCredential) {
        await auth.context.internalAdapter.createAccount({
          userId,
          providerId: "credential",
          password: hashedPassword,
          accountId: userId,
        });
      } else {
        await auth.context.internalAdapter.updatePassword(userId, hashedPassword);
      }
    } catch (authErr) {
      console.error("Better Auth password update failed:", authErr);
      return { success: false, error: authErr instanceof Error ? authErr.message : String(authErr) };
    }
    // --- End Better Auth password update ---

    // Mark the reset token as used only after successful password update
    await PasswordReset.updateOne(
      { _id: resetTokenRecord._id },
      { usedAt: new Date() }
    );

    return {
      success: true,
      message: "Password has been reset successfully.",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      error: "An error occurred while resetting your password. Please try again.",
    };
  }
};

/**
 * Change password for authenticated users
 * Resolves authenticated user from server-side session only (never trusts client)
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: "New password must be at least 8 characters long.",
      };
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        error: "New password must be different from current password.",
      };
    }

    // Resolve authenticated user from server-side session only
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to change your password.",
      };
    }

    // Use better-auth's changePassword API with authenticated session
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        newPassword,
        currentPassword,
      },
    });

    return {
      success: true,
      message: "Password has been changed successfully.",
    };
  } catch (error) {
    console.error("Error changing password:", error);

    // Extract error message
    let errorMessage = "An error occurred while changing your password. Please try again.";

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();
      if (errorStr.includes("incorrect") || errorStr.includes("invalid") || errorStr.includes("wrong")) {
        errorMessage = "Current password is incorrect.";
      } else if (errorStr.includes("same")) {
        errorMessage = "New password must be different from current password.";
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};
