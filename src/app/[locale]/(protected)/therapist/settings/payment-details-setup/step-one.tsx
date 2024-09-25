import { useState, useEffect } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import { MdInfoOutline } from "react-icons/md";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useGetCountries } from "@/hooks/use-get-countries";

const StepOne = ({
  form,
  onNextStep,
  t,
}: {
  form: any;
  onNextStep: () => void;
  t: any;
}) => {
  const countries = useGetCountries();
  const paymentMethods = [
    { label: "Bank transfer (in USD)", value: "bank_usd" },
  ] as any;

  const selectedCountry = form.watch("country");

  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);

  useEffect(() => {
    const isCountrySelected = !!form.getValues("country");
    const isPaymentMethodSelected = !!form.getValues("paymentMethod");

    setIsNextButtonEnabled(isCountrySelected && isPaymentMethodSelected);
  }, [form.watch("country"), form.watch("paymentMethod")]);

  return (
    <div>
      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block">{t("selectYourCountry")}</FormLabel>
            <Popover
              open={countryPopoverOpen}
              onOpenChange={setCountryPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between  w-full sm:w-[280px]"
                >
                  <div className="truncate max-w-[calc(100%-24px)]">
                    {field.value
                      ? countries.find((c: any) => c.value === field.value)
                          ?.label
                      : t("selectYourCountry")}
                  </div>
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search country"
                    value={countrySearch}
                    onValueChange={setCountrySearch}
                  />
                  <CommandList>
                    <CommandEmpty>{t("noCountryFound")}</CommandEmpty>
                    <CommandGroup>
                      {countries
                        .filter((country: any) =>
                          country.label
                            .toLowerCase()
                            .includes(countrySearch.toLowerCase())
                        )
                        .map((country: any) => (
                          <CommandItem
                            key={country.value}
                            onSelect={() => {
                              field.onChange(country.value);
                              setCountryPopoverOpen(false);
                            }}
                          >
                            {country.label}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedCountry && (
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="mt-8">
              <FormLabel>{t("selectPaymentMethod")}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  {paymentMethods?.map((method: any) => (
                    <div
                      key={method.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={method.value} id={method.value} />
                      <Label htmlFor={method.value}>{method.label}</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-2 text-gray-500 cursor-pointer">
                              <MdInfoOutline size={20} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("bankTransferInfo")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={onNextStep}
          disabled={!isNextButtonEnabled}
        >
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default StepOne;
