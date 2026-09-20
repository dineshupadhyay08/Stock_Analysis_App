import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps {
  name: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  error?: { message?: string };
  required?: boolean;
}

const SelectField = ({
  name,
  label,
  placeholder,
  options,
  control,
  error,
  required = false,
}: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </Label>

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full !h-10 px-3 py-2 text-sm md:text-base bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              {options.map((option) => (
                <SelectItem
                  value={option.value}
                  key={option.value}
                  className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
            {error && (
              <p className="text-sm text-destructive animate-in slide-in-from-top-1">
                {error.message}
              </p>
            )}
          </Select>
        )}
      />
    </div>
  );
};

export default SelectField;