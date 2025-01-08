"use client";
import BookingCalendar from "@/app/[locale]/(protected)/(client)/book-appointment/[therapistId]/booking-calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserName } from "@/hooks/use-user-name";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const BookAppointmentCalendar = ({
  therapistsJson,
  appointmentTypes,
  clientsJson,
}: {
  therapistsJson: any;
  appointmentTypes: any;
  clientsJson: any;
}) => {
  const therapists = JSON.parse(therapistsJson);
  const clients = JSON.parse(clientsJson);
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [therapistSearch, setTherapistSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const locale = useLocale();
  const { getFullName } = useUserName();

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Select Client */}
      <div className="w-64 sm:w-1/3 mb-4 sm:px-0">
        <h2>Select Client</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full px-4 py-2 text-left bg-white border rounded-md">
              {selectedClient
                ? getFullName(selectedClient.firstName, selectedClient.lastName)
                : "Select client"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <Command>
              <CommandInput
                placeholder="Search client"
                value={clientSearch}
                onValueChange={setClientSearch}
              />
              <CommandList>
                <CommandEmpty>No clients found</CommandEmpty>
                <CommandGroup>
                  {clients
                    .filter((client: any) =>
                      getFullName(client.firstName, client.lastName)
                        .toLowerCase()
                        .includes(clientSearch.toLowerCase())
                    )
                    .map((client: any) => (
                      <CommandItem
                        key={client._id}
                        onSelect={() => {
                          setSelectedClient(client);
                        }}
                      >
                        {getFullName(client.firstName, client.lastName)}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Select Therapist */}
      <div className="w-64 sm:w-1/3 mb-4 sm:px-0">
        <h2>Select Therapist</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full px-4 py-2 text-left bg-white border rounded-md">
              {selectedTherapist
                ? getFullName(
                    selectedTherapist.firstName,
                    selectedTherapist.lastName
                  )
                : "Select therapist"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <Command>
              <CommandInput
                placeholder="Search therapist"
                value={therapistSearch}
                onValueChange={setTherapistSearch}
              />
              <CommandList>
                <CommandEmpty>No therapists found</CommandEmpty>
                <CommandGroup>
                  {therapists
                    .filter((therapist: any) =>
                      getFullName(therapist.firstName, therapist.lastName)
                        .toLowerCase()
                        .includes(therapistSearch.toLowerCase())
                    )
                    .map((therapist: any) => (
                      <CommandItem
                        key={therapist._id}
                        onSelect={() => {
                          setSelectedTherapist(therapist);
                        }}
                      >
                        {getFullName(therapist.firstName, therapist.lastName)}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Therapist Details */}
      {selectedTherapist && selectedClient && (
        <>
          <div className="flex flex-col items-center">
            <Avatar className="w-28 h-28">
              <AvatarImage src={selectedTherapist?.image || ""} />
              <AvatarFallback className="bg-background flex items-center justify-center w-full h-full">
                <Image
                  width={150}
                  height={50}
                  src={
                    locale === "en"
                      ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
                      : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png"
                  }
                  alt="psychologist-image"
                  className="w-full"
                />
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-bold mb-2">
              {getFullName(
                selectedTherapist.firstName,
                selectedTherapist.lastName
              )}
            </h2>
            <p className="text-gray-600 mb-2">
              {selectedTherapist?.therapistWorkProfile[locale]?.title}
            </p>
          </div>

          <div className="mt-6 rounded-lg md:p-6 w-full">
            <BookingCalendar
              appointmentTypes={appointmentTypes}
              showOnlyIntroCalls={false}
              therapistsAvailableTimes={JSON.stringify(
                selectedTherapist.availableTimes
              )}
              clientId={selectedClient._id.toString()}
              appointments={JSON.stringify(selectedTherapist.appointments)}
              therapistId={selectedTherapist._id.toString()}
              payLaterMode={true}
              inIntroVideoCall={false}
              smallSelect
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BookAppointmentCalendar;
