"use client";

import { useState } from "react";
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import countryList from "react-select-country-list";

type CountrySelectProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  required?: boolean;
};

const CountrySelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  // Get country options with flags
  const countries = countryList().getData();

  // Helper function to get flag emoji
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 px-3 py-2 text-sm md:text-base w-full justify-between font-normal bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span>{getFlagEmoji(value)}</span>
              <span className="text-foreground">
                {countries.find((c) => c.value === value)?.label}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select your country...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 bg-popover border-border"
        align="start"
      >
        <Command className="bg-popover border-border">
          <CommandInput
            placeholder="Search countries..."
            className="bg-popover text-foreground border-0 border-b border-border rounded-none focus:ring-0 placeholder:text-muted-foreground"
          />
          <CommandEmpty className="text-muted-foreground py-6 text-center bg-popover">
            No country found.
          </CommandEmpty>
          <CommandList className="max-h-60 bg-popover scrollbar-hide-default">
            <CommandGroup className="bg-popover">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value}`}
                  onSelect={() => {
                    onChange(country.value);
                    setOpen(false);
                  }}
                  className="text-foreground cursor-pointer px-3 py-2 rounded-sm bg-popover hover:bg-accent"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      value === country.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span>{getFlagEmoji(country.value)}</span>
                    <span>{country.label}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const CountrySelectField = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  required = false,
}: CountrySelectProps<T>) => {
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
          <CountrySelect value={field.value} onChange={field.onChange} />
        )}
      />
      {error && (
        <p className="text-sm text-destructive animate-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Helps us show market data and news relevant to you.
      </p>
    </div>
  );
};