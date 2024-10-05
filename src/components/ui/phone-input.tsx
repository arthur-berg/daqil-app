import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input, InputProps } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import * as countries from "react-phone-number-input/locale/en"; // Add this for country names

import flags from "react-phone-number-input/flags";

// Helper function to match the longest valid country calling code
const getCountryByCallingCode = (input: string) => {
  const countries = RPNInput.getCountries();
  let longestMatch: RPNInput.Country | undefined;

  for (const country of countries) {
    const callingCode = `+${RPNInput.getCountryCallingCode(country)}`;
    if (input.startsWith(callingCode)) {
      if (
        !longestMatch ||
        callingCode.length >
          `+${RPNInput.getCountryCallingCode(longestMatch)}`.length
      ) {
        longestMatch = country;
      }
    }
  }

  return longestMatch;
};

// Phone Input Component
type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, ...props }, ref) => {
      const [country, setCountry] = React.useState<
        RPNInput.Country | undefined
      >(
        props.defaultCountry || "US" // Default to a country, e.g., US
      );
      const [phoneNumber, setPhoneNumber] = React.useState<string | undefined>(
        props.value as string | undefined
      );

      // Update country flag when user changes input manually
      const handleInputChange = (value: string | undefined) => {
        setPhoneNumber(value || "");
        onChange?.(value || ("" as any));

        if (value) {
          const newCountry = getCountryByCallingCode(value);
          if (newCountry) {
            setCountry(newCountry);
          } else {
            setCountry(undefined); // Reset country if no match found
          }
        } else {
          setCountry(undefined); // Reset if the country code is removed
        }
      };

      // When the country is selected, update the input value by prepending the country code
      const handleCountryChange = (selectedCountry: RPNInput.Country) => {
        setCountry(selectedCountry);
        const countryCallingCode = `+${RPNInput.getCountryCallingCode(
          selectedCountry
        )}`;

        // If the input field is empty or doesn't start with the current country code, update it
        if (!phoneNumber || !phoneNumber.startsWith(countryCallingCode)) {
          const updatedNumber = `${countryCallingCode} ${
            phoneNumber?.replace(/^\+\d+/, "") || ""
          }`;
          setPhoneNumber(updatedNumber.trim()); // Prepend country code and trim any extra spaces
          onChange?.(updatedNumber.trim() as any);
        }
      };

      return (
        <div className="flex">
          {/* Country Code Selector */}
          <CountrySelect
            value={country || props.defaultCountry}
            onChange={handleCountryChange}
            options={RPNInput.getCountries().map((c) => ({
              value: c,
              label: `+${RPNInput.getCountryCallingCode(c)} (${c})`, // Assuming label contains both country name and code
            }))}
          />
          {/* Phone Number Input */}
          <Input
            ref={ref as any}
            className={cn("flex-1 rounded-e-lg rounded-s-none", className)}
            value={phoneNumber}
            onChange={(e) => handleInputChange(e.target.value)}
            {...props}
          />
        </div>
      );
    }
  );

PhoneInput.displayName = "PhoneInput";

// Country Select Component with Flags and Country Code
type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country | undefined;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
    },
    [onChange]
  );

  // Filter options based on search input (matches calling code, ISO code, or country name)
  const filteredOptions = React.useMemo(
    () =>
      options.filter((option) => {
        const countryName = countries.default[option.value] || "";
        return (
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          countryName.toLowerCase().includes(searchTerm.toLowerCase()) || // Added filter for country name
          option.label.match(/\+\d+/)?.[0]?.includes(searchTerm)
        );
      }),
    [searchTerm, options]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn("flex gap-2 rounded-e-none rounded-s-lg px-3")}
          disabled={disabled}
        >
          {/* Display Flag and Country Code */}
          <FlagComponent country={value as any} countryName={value as any} />
          <ChevronDownIcon
            className={cn(
              "-mr-2 h-4 w-4 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search by country name, code, or calling code..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2"
                  >
                    <FlagComponent
                      country={option.value}
                      countryName={countries.default[option.value]} // Display the country name
                    />
                    <span className="flex-1 text-sm">
                      {`+${RPNInput.getCountryCallingCode(option.value)} (${
                        option.value
                      }) - ${countries.default[option.value]}`}
                    </span>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        option.value === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
// Flag Component
const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };
