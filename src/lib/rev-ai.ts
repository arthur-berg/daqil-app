const REV_API_KEY = process.env.REV_API_KEY;
const callbackUrl = process.env.REVAI_WEBHOOK_URL;
const REV_BASE_URL = "https://api.rev.ai/speechtotext/v1/jobs";

export const sendToRevAI = async (audioUrl: string) => {
  const response = await fetch(REV_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REV_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_config: {
        url: audioUrl,
        /*    auth_headers: {
          Authorization: `Bearer ${VONAGE_API_KEY}`,
        }, */
      },
      notification_config: {
        url: callbackUrl,
        /*     auth_headers: {
          Authorization: `Bearer ${REV_WEBHOOK_AUTH}`,
        }, */
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send audio to Rev.ai: ${response.status}`);
  }

  const data = await response.json();
  return data.id;
};

export const getRevJobStatus = async (jobId: string) => {
  try {
    const jobDetailsResponse = await fetch(`${REV_BASE_URL}/${jobId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${REV_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!jobDetailsResponse.ok) {
      console.error(
        `Failed to fetch job status. Status: ${jobDetailsResponse.status}`
      );
      return { status: "not_started" };
    }

    const jobDetails = await jobDetailsResponse.json();
    return { status: jobDetails.status };
  } catch (error) {
    console.error("Error retrieving job status:", error);
    return { status: "error" };
  }
};

export const getTranscriptionDetails = async (jobId: string) => {
  try {
    // First, retrieve the job details
    const jobDetailsResponse = await fetch(`${REV_BASE_URL}/${jobId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${REV_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!jobDetailsResponse.ok) {
      console.error(
        `Failed to fetch job details. Status: ${jobDetailsResponse.status}`
      );
      return null;
    }

    const jobDetails = await jobDetailsResponse.json();

    console.log("jobDetails", jobDetails);

    // Fetch the transcription details separately
    const transcriptResponse = await fetch(
      `${REV_BASE_URL}/${jobId}/transcript`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${REV_API_KEY}`,
          Accept: "application/vnd.rev.transcript.v1.0+json",
        },
      }
    );

    if (!transcriptResponse.ok) {
      console.error(
        `Failed to fetch transcription details. Status: ${transcriptResponse.status}`
      );
      return null;
    }

    const transcriptionData = await transcriptResponse.json();

    if (
      !transcriptionData.monologues ||
      !Array.isArray(transcriptionData.monologues)
    ) {
      console.error(
        `Unexpected transcription data format: ${JSON.stringify(
          transcriptionData
        )}`
      );
      return null;
    }

    const transcript = transcriptionData.monologues
      .map((mono: any) =>
        mono.elements
          .filter((el: any) => el.type === "text")
          .map((el: any) => el.value)
          .join(" ")
      )
      .join("\n");

    console.log("Transcription retrieved:", transcript);

    return {
      transcript,
    };
  } catch (error) {
    console.error("Error retrieving transcription details:", error);
    return null;
  }
};
