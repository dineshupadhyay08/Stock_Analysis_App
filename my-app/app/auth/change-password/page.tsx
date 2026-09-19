"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import { changePassword } from "@/lib/actions/password-reset.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await changePassword(
        data.currentPassword,
        data.newPassword
      );

      if (result.success) {
        toast.success("Password changed", {
          description: "Your password has been updated successfully.",
        });
        router.push("/");
      } else {
        toast.error("Password change failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Password change failed", {
        description: e instanceof Error ? e.message : "An error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Change your password
        </h1>
        <p className="text-muted-foreground">
          Enter your current password and choose a new secure password for your Signalist account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          name="currentPassword"
          label="Current Password"
          placeholder="Enter your current password"
          type="password"
          register={register}
          error={errors.currentPassword}
          validation={{
            required: "Current password is required",
          }}
        />

        <InputField
          name="newPassword"
          label="New Password"
          placeholder="Enter your new password"
          type="password"
          register={register}
          error={errors.newPassword}
          validation={{
            required: "New password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
        />

        <InputField
          name="confirmPassword"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          type="password"
          register={register}
          error={errors.confirmPassword}
          validation={{
            required: "Please confirm your password",
            validate: (value) =>
              value === newPassword || "Passwords do not match",
          }}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-gray-950 font-semibold rounded-lg shadow-lg shadow-yellow-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changing Password...
            </>
          ) : (
            <>
              Change Password
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
