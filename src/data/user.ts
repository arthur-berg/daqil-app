import connectToMongoDB from "@/lib/mongoose";
import { UserRole } from "@/generalTypes";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { getTherapistAvailableTimeSlots } from "@/utils/therapistAvailability";
import { addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });

    return user;
  } catch {
    return null;
  }
};

export const getAllClientsAdmin = async () => {
  try {
    const clients = await User.find(
      { role: "CLIENT" },
      {
        _id: 1,
        email: 1,
        "settings.timeZone": 1,
        "personalInfo.phoneNumber": 1,
        "firstName.en": 1,
        "lastName.en": 1,
        createdAt: 1,
      }
    ).lean();

    return clients.map((client: any) => ({
      ...client,
      _id: client._id.toString(),
    }));
  } catch {
    return null;
  }
};

export const getAllClients = async () => {
  try {
    const clients = await User.find({ role: UserRole.CLIENT })
      .populate({
        path: "appointments.bookedAppointments",
        model: "Appointment",
      })
      .lean();

    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return null;
  }
};

export const getUserByIdLean = async (id: string) => {
  try {
    const user = await User.findById(id).lean();

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await User.findById(id);

    return user;
  } catch {
    return null;
  }
};

export const getClientById = async (id: string) => {
  try {
    if (!Appointment.schema) {
      throw new Error("Appointment schema is not registered.");
    }
    const client = await User.findById(id)
      .select(
        "firstName lastName email selectedTherapist.therapist selectedTherapistHistory appointments personalInfo"
      )
      .populate({
        path: "selectedTherapist.therapist",
        select: "firstName lastName email",
      })
      .populate({
        path: "selectedTherapistHistory.therapist",
        select: "firstName lastName email",
      })
      .populate({
        path: "appointments.bookedAppointments",
        populate: {
          path: "hostUserId",
          select: "firstName lastName status appointmentTypeId",
        },
        match: { status: { $ne: "canceled" } },
      });

    if (!client) {
      return null;
    }

    // Calculate appointment counts for each therapist in the history
    const therapistAppointmentCounts = client.selectedTherapistHistory.map(
      (history: any) => {
        const appointmentCount = client.appointments.flatMap(
          (appointment: any) => {
            return appointment.bookedAppointments.filter((appt: any) => {
              return (
                appt.hostUserId._id.toString() ===
                  history.therapist._id.toString() && appt.status !== "canceled"
              );
            });
          }
        ).length;

        return {
          therapist: history.therapist,
          appointmentCount,
          startDate: history.startDate,
          endDate: history.endDate,
          current: history.current,
        };
      }
    );

    return {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      selectedTherapist: client.selectedTherapist.therapist,
      therapistAppointmentCounts,
      personalInfo: client.personalInfo,
    };
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    return null;
  }
};

export const getClients = async (therapistId: string) => {
  try {
    const therapist = await User.findById(therapistId).populate({
      path: "assignedClients",
      select: "firstName lastName email appointments",
    });

    if (therapist) {
      const clientsWithAppointmentCounts = therapist.assignedClients.map(
        (client: any) => {
          return {
            id: client._id.toString(),
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            totalAppointments: client.appointments.length, // Counting the number of appointments
          };
        }
      ) as any;

      return clientsWithAppointmentCounts;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

const getUserWithAppointments = async (id: string) => {
  try {
    await connectToMongoDB();

    const user = await User.findById(id)
      .populate([
        "appointments.bookedAppointments",
        "appointments.temporarilyReservedAppointments",
      ])
      .lean();

    if (!user) {
      console.log(`User with id ${id} not found.`);
      return null;
    }

    return user as any;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
};

export const getClientByIdAppointments = async (id: string) => {
  try {
    const client = await getUserWithAppointments(id);

    if (!client) {
      console.log(`Client with id ${id} not found or error occurred.`);
      return null;
    }

    return client;
  } catch (error) {
    console.error(`Error fetching client with id ${id}:`, error);
    return null;
  }
};

export const getTherapistById = async (id: string) => {
  try {
    const therapist = await getUserWithAppointments(id);

    return therapist;
  } catch {
    return null;
  }
};

export const getTherapistInvoicesById = async (therapistId: string) => {
  try {
    await connectToMongoDB();

    const therapist = await User.findById(therapistId).populate({
      path: "appointments.bookedAppointments",
      match: { status: "completed" },
      populate: {
        path: "participants.userId",
        select: "firstName lastName",
      },
    });

    if (!therapist) {
      console.log(`Therapist with id ${therapistId} not found.`);
      return null;
    }

    return therapist;
  } catch (error) {
    console.error(
      `Error fetching therapist invoices for id ${therapistId}:`,
      error
    );
    return null;
  }
};

export const getTherapistAdminProfileById = async (id: string) => {
  try {
    await connectToMongoDB();

    const therapist = await User.findById(id)
      .populate([
        "appointments.bookedAppointments",
        "appointments.temporarilyReservedAppointments",
        "assignedClients",
      ])

      .lean();

    if (!therapist) {
      console.log(`therapist with id ${id} not found.`);
      return null;
    }

    return therapist as any;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
};

//emailVerified: { $ne: null },
export const getTherapists = async () => {
  try {
    const therapists = await User.find({
      role: UserRole.THERAPIST,
      isAccountSetupDone: true,
      $or: [
        { "settings.hiddenProfile": { $exists: false } },
        { "settings.hiddenProfile": false },
      ],
    }).lean();

    return therapists;
  } catch {
    return null;
  }
};

export const getTherapistsWithNextAvailableTime = async (
  startingDate = new Date(),
  userTimeZone: string,
  appointmentType: any
) => {
  try {
    const maxLookAheadDays = 30;
    const formattedStartingDate = toZonedTime(startingDate, userTimeZone);

    const therapists = await User.find({
      role: UserRole.THERAPIST,
      isAccountSetupDone: true,
      $or: [
        { "settings.hiddenProfile": { $exists: false } },
        { "settings.hiddenProfile": false },
      ],
    })
      .populate([
        {
          path: "appointments.bookedAppointments",
          match: {
            status: "confirmed",
            startDate: {
              $gte: formattedStartingDate,
              $lte: addDays(formattedStartingDate, maxLookAheadDays),
            },
          },
        },
        {
          path: "appointments.temporarilyReservedAppointments",
          match: {
            status: "temporarily-reserved",
            startDate: {
              $gte: formattedStartingDate,
              $lte: addDays(formattedStartingDate, maxLookAheadDays),
            },
          },
        },
      ])
      .lean();

    const therapistsWithNextAvailableTime = await Promise.all(
      therapists.map(async (therapist: any) => {
        const availableTimes = therapist.availableTimes;

        therapist.nextAvailableSlot = null;

        let currentDate = new Date(startingDate);
        for (let i = 0; i < maxLookAheadDays; i++) {
          const allAvailableSlots = getTherapistAvailableTimeSlots(
            availableTimes,
            appointmentType,
            currentDate,
            therapist.appointments,
            userTimeZone
          );

          if (allAvailableSlots.length > 0) {
            therapist.nextAvailableSlot = allAvailableSlots[0].start;
            break;
          }

          currentDate = addDays(currentDate, 1);
        }

        return therapist;
      })
    );

    const sortedTherapists = therapistsWithNextAvailableTime.sort((a, b) => {
      if (!a.nextAvailableSlot) return 1;
      if (!b.nextAvailableSlot) return -1;
      return (
        new Date(a.nextAvailableSlot).getTime() -
        new Date(b.nextAvailableSlot).getTime()
      );
    });

    return sortedTherapists;
  } catch (error) {
    console.error("Error fetching therapists with availability:", error);
    return [];
  }
};

export const getTherapistsAdminView = async () => {
  try {
    const therapists = await User.find({
      role: UserRole.THERAPIST,
    }).lean();

    return therapists;
  } catch {
    return null;
  }
};
