"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import { initiatePasswordReset } from "@/lib/actions/password-reset.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await initiatePasswordReset(data.email);

      if (result.success) {
        toast.success("Verification code sent", {
          description: result.message,
        });

        // Navigate to verification page with email
        router.push(`/auth/verify-reset-code?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error("Request failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Request failed", {
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
          Forgot your password?
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          name="email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
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
              Sending Code...
            </>
          ) : (
            <>
              Send Verification Code
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

export default ForgotPassword;
