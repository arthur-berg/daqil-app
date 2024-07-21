"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format, set, addMinutes, isBefore } from "date-fns";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandList,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

const generateTimeIntervals = (intervalMinutes = 15) => {
  const times = [];
  const start = set(new Date(), {
    hours: 6,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const end = set(new Date(), {
    hours: 23,
    minutes: 59,
    seconds: 0,
    milliseconds: 0,
  });
  let current = start;
  while (isBefore(current, end)) {
    times.push(current.toTimeString().slice(0, 5));
    current = addMinutes(current, intervalMinutes);
  }
  return times;
};

const timeOptions = generateTimeIntervals(15);

const SpecificAvailabilityForm = ({
  specificAvailableTimes,
}: {
  specificAvailableTimes: any;
}) => {
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>();

  const form = useForm({
    defaultValues: {
      timeRanges: [{ startDate: "", endDate: "" }],
    },
  });

  const onSubmit = (values: any) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const times = values.timeRanges.map(({ startDate, endDate }) => ({
      from: startDate,
      to: endDate,
    }));

    toast({
      variant: "success",
      title: "Specific times saved successfully.",
    });
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Select Specific Available Times
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold">
          Overview of Specific Available Times
        </h3>
        <div className="space-y-2">
          {specificAvailableTimes.map(({ date, times }, index) => (
            <div key={index} className="border p-2 rounded">
              <div className="font-semibold">
                {format(new Date(date), "PPPP")}
              </div>
              <div className="flex gap-2 flex-wrap">
                {times.map((time, i) => (
                  <span
                    key={i}
                    className="bg-blue-500 text-white rounded px-2 py-1"
                  >
                    {time.from} - {time.to}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Calendar
        mode="single"
        selected={date}
        onSelect={(date) => {
          setDate(date);
          form.reset({ timeRanges: [{ startDate: "", endDate: "" }] });
        }}
        className="rounded-md border h-full w-full flex"
        classNames={{
          months:
            "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
          month: "space-y-4 w-full flex flex-col",
          table: "w-full h-full border-collapse space-y-1",
          head_row: "",
          row: "w-full mt-2",
        }}
      />

      {date && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">
                Available Times for {format(date, "PPPP")}
              </h3>
              {form.watch("timeRanges").map((_, index) => (
                <div key={index} className="flex gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name={`timeRanges.${index}.startDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-[150px] justify-between"
                              >
                                {field.value
                                  ? field.value
                                  : "Select start time"}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[150px] p-0">
                              <Command>
                                <CommandInput placeholder="Search time..." />
                                <CommandList>
                                  <CommandEmpty>No time found.</CommandEmpty>
                                  <CommandGroup>
                                    {timeOptions.map((time) => (
                                      <CommandItem
                                        value={time}
                                        key={time}
                                        onSelect={() => {
                                          form.setValue(
                                            `timeRanges.${index}.startDate`,
                                            time
                                          );
                                        }}
                                      >
                                        <CheckIcon
                                          className={`mr-2 h-4 w-4 ${
                                            time === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                        />
                                        {time}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`timeRanges.${index}.endDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-[150px] justify-between"
                              >
                                {field.value ? field.value : "Select end time"}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[150px] p-0">
                              <Command>
                                <CommandInput placeholder="Search time..." />
                                <CommandList>
                                  <CommandEmpty>No time found.</CommandEmpty>
                                  <CommandGroup>
                                    {timeOptions.map((time) => (
                                      <CommandItem
                                        value={time}
                                        key={time}
                                        onSelect={() => {
                                          form.setValue(
                                            `timeRanges.${index}.endDate`,
                                            time
                                          );
                                        }}
                                      >
                                        <CheckIcon
                                          className={`mr-2 h-4 w-4 ${
                                            time === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                        />
                                        {time}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                onClick={() =>
                  form.setValue("timeRanges", [
                    ...form.watch("timeRanges"),
                    { startDate: "", endDate: "" },
                  ])
                }
                type="button"
                variant="outline"
                className="mt-4"
              >
                Add Time Range
              </Button>
            </div>
            {form.watch("timeRanges").length > 0 && (
              <div className="mt-4">
                <Button type="submit" variant="success">
                  Save Available Times
                </Button>
              </div>
            )}
          </form>
        </Form>
      )}
    </div>
  );
};

export default SpecificAvailabilityForm;
