"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import { resetPassword } from "@/lib/actions/password-reset.actions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (!emailParam || !tokenParam) {
      toast.error("Missing reset information", {
        description: "Please start from the forgot password flow.",
      });
      router.push("/auth/forgot-password");
      return;
    }

    setEmail(emailParam);
    setResetToken(tokenParam);
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email || !resetToken) {
      toast.error("Missing reset information", {
        description: "Please start from the forgot password flow.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email, resetToken, data.newPassword);

      if (result.success) {
        toast.success("Password reset successful", {
          description: "You can now sign in with your new password.",
        });

        // Navigate to sign-in page
        router.push("/auth/sign-in");
      } else {
        toast.error("Password reset failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Password reset failed", {
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
          Set a new password
        </h1>
        <p className="text-muted-foreground">
          Choose a strong, secure password for your Signalist account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          name="newPassword"
          label="New Password"
          placeholder="Enter your new password"
          type="password"
          register={register}
          error={errors.newPassword}
          validation={{
            required: "Password is required",
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
              Resetting Password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>

        <FooterLink
          text="Remember your password?"
          linkText="Sign in"
          href="/auth/sign-in"
        />
      </form>
    </div>
  );
};

export default ResetPassword;
