"use server";

const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;
const appId = process.env.VONAGE_APP_ID;
const privateKeyPath = process.env.VONAGE_PRIVATE_KEY_PATH;

if (!apiKey || !apiSecret || !appId || !privateKeyPath) {
  throw new Error(
    "Missing config values for env params VONAGE_API_KEY and VONAGE_API_SECRET"
  );
}
import fs from "fs";
import { tokenGenerate } from "@vonage/jwt";
import { revalidatePath } from "next/cache";

let privateKey;
try {
  privateKey = fs.readFileSync(privateKeyPath, "utf8");
} catch (error) {
  throw new Error("Failed to read private key file: " + error.message);
}

const generateToken = () => {
  try {
    const token = tokenGenerate(appId, privateKey);

    return token;
  } catch (error) {
    throw new Error("Failed to generate token: " + error.message);
  }
};

export const createMeeting = async () => {
  const token = generateToken();

  const url = "https://api-eu.vonage.com/meetings/rooms";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    display_name: "Session with Dr. Smith",
    type: "instant",
    join_approval_level: "explicit_approval",
    available_features: { is_locale_switcher_available: true },
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    revalidatePath("/meetings");

    return data;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

export const getMeetings = async () => {
  const token = generateToken();

  const url = "https://api-eu.vonage.com/v1/meetings/rooms";
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        `Error: ${response.statusText} - ${errorResponse.message}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting rooms:", error.message);
    throw error;
  }
};

export const getMeeting = async (roomId: string) => {
  const token = generateToken();

  const url = `https://api-eu.vonage.com/v1/meetings/rooms/${roomId}`;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        `Error: ${response.statusText} - ${errorResponse.message}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting room:", error.message);
    throw error;
  }
};
