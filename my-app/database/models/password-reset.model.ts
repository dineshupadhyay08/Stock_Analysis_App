import { Schema, model, models, type Document, type Model } from "mongoose";

export interface PasswordResetToken extends Document {
  email: string;
  codeHash: string;
  resetTokenHash?: string;
  expiresAt: Date;
  resetTokenExpiresAt?: Date;
  attemptCount: number;
  usedAt?: Date;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<PasswordResetToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    resetTokenHash: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // TTL index - documents expire at this time
    },
    resetTokenExpiresAt: {
      type: Date,
      required: false,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    usedAt: {
      type: Date,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// TTL index for automatic cleanup of expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient lookups
PasswordResetSchema.index({ email: 1, createdAt: -1 });

export const PasswordReset: Model<PasswordResetToken> =
  (models?.PasswordReset as Model<PasswordResetToken>) ||
  model<PasswordResetToken>("PasswordReset", PasswordResetSchema);
