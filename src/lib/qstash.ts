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
    const date = new Date(unixTimestampInSeconds * 1000);
    const dateString = date.toISOString();
    console.log(`Scheduled task to ${url} with date: ${dateString}.`);
    return response.messageId; // Correct usage: Return 'messageId'
  } catch (error) {
    console.error("Error scheduling task with QStash:", error);
    throw error;
  }
};

export const addTranscriptionJobToQueue = async (
  jobId: string,
  sentimentJobId?: string
) => {
  try {
    const body: Record<string, unknown> = {
      jobId: jobId,
    };
    if (sentimentJobId) {
      body["sentimentJobId"] = sentimentJobId;
    }
    const response = await qstashClient.publishJSON({
      url: `${process.env.QSTASH_TRANSCRIPTION_API_URL}/process-transcription-job`,
      body: body,
      retries: 3,
      method: "POST",
      rateLimit: 15,
      backoff: "exponential",
    });

    console.log(`Published job for archiveId: ${jobId}`);
    return response.messageId;
  } catch (error) {
    console.error("Error adding to QStash queue:", error);
    throw error;
  }
};

// rateLimits we should use for different tiers in OpenAI's API
// Tier 2
// rateLimit: 25 (RPM estimated around 25 requests per minute)

// Tier 3
// rateLimit: 40 (RPM estimated around 40 requests per minute)

// Tier 4
// rateLimit: 80 (RPM estimated around 80 requests per minute)

// Tier 5
// rateLimit: 150 (RPM estimated around 150 requests per minute)

// Note: These are estimated rate limits based on the typical RPM for each tier.
// Check OpenAI's dashboard for your actual limits and adjust accordingly.
