import AppointmentType from "@/models/AppointmentType";

export const getAppointmentTypes = async (appointmentType: string) => {
  try {
    const appointmentTypes = await AppointmentType.find({
      appointmentType,
    }).lean();
    /* const serializedAppointmentTypes = appointmentTypes.map(
      (appointmentType: any) => ({
        ...appointmentType,
        _id: appointmentType._id.toString(),
      })
    ) as any;

    return serializedAppointmentTypes; */
    return appointmentTypes;
  } catch {
    return null;
  }
};

export const getAppointmentTypeById = async (id: string) => {
  try {
    const appointmentType = await AppointmentType.findById(id);
    return appointmentType;
  } catch (error) {
    return null;
  }
};
