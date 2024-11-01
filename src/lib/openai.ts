import {
  TEST_SAMPLE_SENTIMENT_ANALYSIS,
  TEST_SAMPLE_TRANSCRIPT,
} from "@/contants/sampleTranscript";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const REQUIRED_SECTIONS = [
  "Emotional State of the Client",
  "Main Topics Discussed",
  "Therapeutic Techniques Used",
  "Client's Progress and Goals",
  "Challenges and Concerns",
  "Therapist's Recommendations",
];

export async function generateValidatedSummary(
  transcript: string,
  sentimentAnalysis: any | undefined
) {
  try {
    return await validateAndRetrySummary(transcript, sentimentAnalysis);
  } catch (error) {
    console.error("Error generating validated summary:", error);
    return null;
  }
}

async function validateAndRetrySummary(
  transcript: string,
  sentimentAnalysis: any | undefined,
  retryLimit: number = 2
) {
  for (let attempt = 0; attempt <= retryLimit; attempt++) {
    const summaryContent = await summarizeTranscribedText(
      transcript,
      sentimentAnalysis
    );

    if (!summaryContent) {
      throw new Error("Failed to generate summary content.");
    }

    const isValid = REQUIRED_SECTIONS.every((section) =>
      summaryContent.includes(section)
    );

    if (isValid) {
      return summaryContent;
    }

    console.warn(`Validation failed on attempt ${attempt + 1}, retrying...`);
  }

  throw new Error("Failed to generate a valid summary after retries.");
}

export const summarizeTranscribedText = async (
  transcript: string,
  sentimentAnalysis: any | undefined
) => {
  const sampleTranscript = TEST_SAMPLE_TRANSCRIPT;

  const toneAndScore = sentimentAnalysis
    ? determineOverallTone(sentimentAnalysis)
    : null;

  const sentimentAnalysisSection = toneAndScore
    ? `
Client's Emotional Tone: ${toneAndScore.tone} (Score: ${toneAndScore.score}/100)
The following section uses sentiment analysis to provide an overview of the client's emotional tone throughout the session.`
    : "";

  const messages = [
    {
      role: "system",
      content:
        "You are an expert evaluator of therapy sessions. Your task is to assess and summarize the session based on the provided transcript.",
    },
    {
      role: "user",
      content: `
The following transcript is a therapy session between a client and a therapist. The conversation alternates between them, with the therapist providing guidance, techniques, or suggestions, while the client expresses feelings, concerns, or experiences.

${sentimentAnalysisSection}

Please summarize the session in a structured format, without using Markdown symbols like * or **, and respond only in plain text.

Summary Structure:
1. Emotional State of the Client (Highlight how the client feels about themselves and their experiences.)
2. Main Topics Discussed
3. Therapeutic Techniques Used
4. Client's Progress and Goals
5. Challenges and Concerns
6. Therapist's Recommendations

Each section should begin with its title, followed by a summary of relevant information. The summary should be concise, clear, and in English.

Transcript (may be in Arabic or English): ${transcript}
  `,
    },
    {
      role: "user",
      content: sampleTranscript,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any,
      max_tokens: 700,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response choices returned from OpenAI.");
    }

    const content = response.choices[0].message?.content?.trim();
    if (!content) {
      throw new Error("Empty response content from OpenAI.");
    }

    const htmlContent = `
    <div><h3>Therapy Session Summary</h3>
    ${
      toneAndScore
        ? `<h4>Client's Emotional Tone</h4><p>${toneAndScore.tone} (Score: ${toneAndScore.score}/100)</p>`
        : ""
    }
    ${REQUIRED_SECTIONS.map(
      (section) =>
        `<h4>${section}</h4><p>${extractSection(content, section)}</p>`
    ).join("")}
  </div>`;

    return htmlContent;
  } catch (error) {
    console.error("Error summarizing transcribed text:", error);
    return null;
  }
};

function determineOverallTone(sentimentAnalysis: any) {
  const averageScore =
    sentimentAnalysis.reduce(
      (sum: any, message: any) => sum + message.score,
      0
    ) / sentimentAnalysis.length;

  // Transform score from [-1, 1] range to [1, 100] range
  const transformedScore = ((averageScore + 1) / 2) * 99 + 1;

  let tone;
  if (averageScore > 0.3) tone = "Positive";
  else if (averageScore < -0.3) tone = "Negative";
  else tone = "Neutral";

  return { tone, score: transformedScore.toFixed(0) };
}

// Helper function to extract content based on labeled sections
function extractSection(content: string, sectionTitle: string): string {
  const regex = new RegExp(
    `${sectionTitle}\\s*:?\\s*(.*?)(?=\\n\\d\\.|\\n${REQUIRED_SECTIONS.join(
      "|"
    )}|$)`,
    "s"
  );
  const match = content.match(regex);

  if (match) {
    let extractedContent = match[1].trim();

    // Clean up any leading colons or extra whitespace
    extractedContent = extractedContent.replace(/^:+\s*/, "").trim();

    return extractedContent;
  }

  return "No valuable information was provided for this section.";
}

export default openai;
