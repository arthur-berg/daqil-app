import { TEST_SAMPLE_TRANSCRIPT } from "@/contants/sampleTranscript";

const REV_API_KEY = process.env.REV_API_KEY;
const transcriptionCallbackUrl = process.env.REVAI_TRANSCRIPTION_WEBHOOK_URL;
const sentimentCallbackUrl = process.env.REVAI_SENTIMENT_WEBHOOK_URL;
const REV_BASE_URL = "https://api.rev.ai/speechtotext/v1/jobs";
const REV_SENTIMENT_BASE_URL = "https://api.rev.ai/sentiment_analysis/v1/jobs";

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
        url: transcriptionCallbackUrl,
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

export const getTranscriptionDetails = async (
  jobId: string,
  sentimentJobId?: string
) => {
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

    // Initialize result with transcription details
    const result: any = {
      transcript,
    };

    // If a sentimentJobId is provided, fetch the sentiment analysis results
    if (sentimentJobId) {
      const sentimentResults = await fetchSentimentResults(sentimentJobId);
      if (sentimentResults) {
        result.sentimentAnalysis = sentimentResults;
      } else {
        console.error(
          `Failed to retrieve sentiment analysis for job: ${sentimentJobId}`
        );
      }
    }
    return result;
  } catch (error) {
    console.error("Error retrieving transcription details:", error);
    return null;
  }
};

export const submitSentimentAnalysisJob = async (jobId: string) => {
  const transcriptionDetails = await getTranscriptionDetails(jobId);
  if (!transcriptionDetails) {
    throw new Error(
      `Failed to retrieve transcription details for job ID: ${jobId}`
    );
  }

  const { transcript } = transcriptionDetails;

  const hardcodedTranscript = TEST_SAMPLE_TRANSCRIPT;

  const response = await fetch(
    "https://api.rev.ai/sentiment_analysis/v1/jobs",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: hardcodedTranscript,
        metadata: "Sentiment analysis for transcription",
        notification_config: {
          url: sentimentCallbackUrl,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `Failed to submit sentiment analysis job: ${response.status}\nDetails: ${errorText}`
    );
    return null;
  }

  const data = await response.json();
  console.log(`Sentiment analysis job submitted with ID: ${data.id}`);

  return data.id;
};

/* export const getTranscriptionDetailsAndAnalyzeSentiment = async (
  jobId: string
) => {
  const transcriptionResult = await getTranscriptionDetails(jobId);
  if (!transcriptionResult) return null;

  const { transcript } = transcriptionResult;

  const jsonTranscript = {
    monologues: transcriptionResult.monologues,
  };

  const sentimentJobId = await submitSentimentAnalysisJob(jsonTranscript);

  return {
    transcript,
    sentimentJobId,
  };
};
 */

export const fetchSentimentResults = async (sentimentJobId: string) => {
  const response = await fetch(
    `${REV_SENTIMENT_BASE_URL}/${sentimentJobId}/result`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${REV_API_KEY}`,
        Accept: "application/vnd.rev.sentiment.v1.0+json",
      },
    }
  );

  if (!response.ok) {
    console.error(
      `Failed to fetch sentiment results for job: ${sentimentJobId}`
    );
    return null;
  }

  const data = await response.json();
  return data.messages.map((message: any) => ({
    content: message.content,
    score: message.score,
    sentiment: message.sentiment,
    timestamp: { start: message.ts, end: message.end_ts },
  }));
};
