import { Client } from "@upstash/qstash";

export const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN as string,
});

export const scheduleTask = async (
  url: string,
  body: any,
  unixTimestampInSeconds: number,
  locale?: string
) => {
  try {
    const response = await qstashClient.publishJSON({
      url,
      body: { ...body, locale: locale },
      retries: 3,
      method: "POST",
      notBefore: unixTimestampInSeconds,
    });
    console.log(
      `Scheduled task to ${url} with absolute time ${unixTimestampInSeconds}.`
    );
    return response.messageId; // Correct usage: Return 'messageId'
  } catch (error) {
    console.error("Error scheduling task with QStash:", error);
    throw error;
  }
};
