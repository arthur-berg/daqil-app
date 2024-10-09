"use server";

import { revalidatePath } from "next/cache";

export const revalidateBookAppointmentCache = () => {
  revalidatePath("/book-appointment");
};
