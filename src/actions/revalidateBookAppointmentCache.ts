"use server";

import { revalidatePath } from "next/cache";

export const revalidateBookAppointmentCache = () => {
  revalidatePath("/book-appointment");
};

export const revalidateClientAppointentListCache = () => {
  revalidatePath("/appointments");
};

export const revalidateTherapistAppointentListCache = () => {
  revalidatePath("/therapist/appointments");
};
