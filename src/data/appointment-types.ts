import AppointmentType from "@/models/AppointmentType";

export const getAppointmentTypeById = async (id: string) => {
  try {
    const appointmentType = await AppointmentType.findById(id);
    return appointmentType;
  } catch (error) {
    return null;
  }
};
