"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import { verifyResetCode } from "@/lib/actions/password-reset.actions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";

interface VerifyCodeFormData {
  code: string;
}

const VerifyResetCode = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      toast.error("Missing email", {
        description: "Please start from the forgot password page.",
      });
      router.push("/auth/forgot-password");
      return;
    }
    setEmail(emailParam);
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeFormData>({
    defaultValues: {
      code: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: VerifyCodeFormData) => {
    if (!email) {
      toast.error("Missing email", {
        description: "Please start from the forgot password page.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyResetCode(email, data.code);

      if (result.success && result.resetToken) {
        toast.success("Code verified", {
          description: "Redirecting to reset your password...",
        });

        // Navigate to reset password page with reset token
        router.push(
          `/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(result.resetToken)}`
        );
      } else {
        toast.error("Verification failed", {
          description: result.error || "Invalid verification code.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Verification failed", {
        description: e instanceof Error ? e.message : "An error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    router.push(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Enter verification code
        </h1>
        <p className="text-muted-foreground">
          We've sent a 6-digit verification code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          name="code"
          label="Verification Code"
          placeholder="000000"
          type="text"
          register={register}
          error={errors.code}
          validation={{
            required: "Verification code is required",
            pattern: {
              value: /^\d{6}$/,
              message: "Code must be 6 digits",
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
              Verifying...
            </>
          ) : (
            <>
              Verify Code
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Didn't receive the code?{" "}
            <span className="text-yellow-500 hover:text-yellow-400 font-medium">
              Request a new one
            </span>
          </button>
        </div>

        <FooterLink
          text="Remember your password?"
          linkText="Sign in"
          href="/auth/sign-in"
        />
      </form>
    </div>
  );
};

export default VerifyResetCode;
