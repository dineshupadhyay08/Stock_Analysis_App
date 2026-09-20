import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  register: import("react-hook-form").UseFormRegister<any>;
  error?: { message?: string };
  validation?: import("react-hook-form").RegisterOptions;
  disabled?: boolean;
  value?: string;
}

const InputField = ({
  name,
  label,
  placeholder,
  type = "text",
  register,
  error,
  validation,
  disabled,
  value,
}: FormInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        type={type}
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        className={cn(
          "h-10 px-3 py-2 text-sm md:text-base bg-background border border-input rounded-lg",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-destructive focus:ring-destructive"
        )}
        {...register(name, validation)}
      />
      {error && (
        <p className="text-sm text-destructive animate-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default InputField;