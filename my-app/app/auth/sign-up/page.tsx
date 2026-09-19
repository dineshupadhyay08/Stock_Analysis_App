"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import SelectField from "@/components/forms/SelectField";
import {
  INVESTMENT_GOALS,
  PREFERRED_INDUSTRIES,
  RISK_TOLERANCE_OPTIONS,
} from "@/lib/constants";
import { CountrySelectField } from "@/components/forms/CountrySelectField";
import FooterLink from "@/components/forms/FooterLink";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { authClient } from "@/components/auth/session-provider";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  country: string;
  investmentGoals: string;
  riskTolerance: string;
  preferredIndustry: string;
}

export const SignUp = () => {
  const [showGoogle, setShowGoogle] = useState(false);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setShowGoogle(true);
    }
  }, []);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);


  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      country: "US",
      investmentGoals: "Growth",
      riskTolerance: "Medium",
      preferredIndustry: "Technology",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const result = await signUpWithEmail(data);
      if (result.success) {
        toast.success("Account created!", {
          description: "Welcome to Signalist. Redirecting...",
        });
        router.push("/");
      } else {
        toast.error("Sign up failed", {
          description: result.error || "Failed to create an account.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Sign up failed", {
        description: e instanceof Error ? e.message : "Failed to create an account.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Create your Signalist account
        </h1>
        <p className="text-muted-foreground">
          Start your financial intelligence journey with personalized insights.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField
            name="fullName"
            label="Full Name"
            placeholder="Enter your name"
            register={register}
            error={errors.fullName}
            validation={{
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            }}
          />

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
        </div>

        <InputField
          name="password"
          label="Password"
          placeholder="Create a strong password (min 8 characters)"
          type="password"
          register={register}
          error={errors.password}
          validation={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CountrySelectField
            name="country"
            label="Country"
            control={control}
            error={errors.country}
            required
          />

          <SelectField
            name="investmentGoals"
            label="Investment Goals"
            placeholder="Select your goal"
            options={INVESTMENT_GOALS}
            control={control}
            error={errors.investmentGoals}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectField
            name="riskTolerance"
            label="Risk Tolerance"
            placeholder="Select risk level"
            options={RISK_TOLERANCE_OPTIONS}
            control={control}
            error={errors.riskTolerance}
            required
          />

          <SelectField
            name="preferredIndustry"
            label="Preferred Industry"
            placeholder="Select industry"
            options={PREFERRED_INDUSTRIES}
            control={control}
            error={errors.preferredIndustry}
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-gray-950 font-semibold rounded-lg shadow-lg shadow-yellow-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Your Investing Journey
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>

        <FooterLink
          text="Already have an account?"
          linkText="Sign in"
          href="/auth/sign-in"
        />
      </form>
    </div>
  );
};

export default SignUp;
