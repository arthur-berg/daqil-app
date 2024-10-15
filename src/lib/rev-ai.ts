const REV_API_KEY = process.env.REV_API_KEY;
const callbackUrl = process.env.REVAI_WEBHOOK_URL;
const REV_BASE_URL = "https://api.rev.ai/speechtotext/v1/jobs";

export const sendToRevAI = async (audioUrl: string, archiveId: string) => {
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
      custom_metadata: JSON.stringify({ archiveId }), // Embed your archiveId for reference
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send audio to Rev.ai: ${response.status}`);
  }

  const data = await response.json();
  return data.id; // Job ID returned from Rev.ai
};

export const getTranscriptionDetails = async (jobId: string) => {
  try {
    const response = await fetch(`${REV_BASE_URL}/${jobId}/transcript`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${REV_API_KEY}`,
        Accept: "application/vnd.rev.transcript.v1.0+json",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch transcription details. Status: ${response.status}`
      );
      return null;
    }

    const transcriptionData = await response.json();

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
      archiveId: transcriptionData.metadata?.custom_metadata?.archiveId, // Assuming this is set when creating the job
    };
  } catch (error) {
    console.error("Error retrieving transcription details:", error);
    return null;
  }
};
