import AppointmentType from "@/models/AppointmentType";

export const getAppointmentTypeById = async (id: string) => {
  try {
    const appointmentType = (await AppointmentType.findById(id).lean()) as any;
    return { ...appointmentType, _id: appointmentType._id.toString() };
  } catch (error) {
    return null;
  }
};

export const getAppointmentTypesByIDs = async (ids: string[]) => {
  try {
    const appointmentTypes = (await AppointmentType.find({
      _id: { $in: ids },
    }).lean()) as any[];
    return appointmentTypes.map((appointmentType) => ({
      ...appointmentType,
      _id: appointmentType._id.toString(),
    }));
  } catch (error) {
    return null;
  }
};
