import connectToMongoDB from "@/lib/mongoose";
import { UserRole } from "@/generalTypes";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });

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
    const client = await User.findById(id)
      .select(
        "firstName lastName email selectedTherapist.therapist selectedTherapistHistory appointments"
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
          select: "firstName lastName",
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

    const user = await User.findById(id).populate([
      "appointments.bookedAppointments",
      "appointments.temporarilyReservedAppointments",
    ]);

    if (!user) {
      console.log(`User with id ${id} not found.`);
      return null;
    }

    return user;
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

//emailVerified: { $ne: null },

export const getTherapists = async () => {
  try {
    const therapists = await User.find({
      role: UserRole.THERAPIST,
    }).lean();

    return therapists;
  } catch {
    return null;
  }
};
