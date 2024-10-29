import {
  TEST_SAMPLE_SENTIMENT_ANALYSIS,
  TEST_SAMPLE_TRANSCRIPT,
} from "@/contants/sampleTranscript";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const summarizeTranscribedText = async (
  transcript: string,
  sentimentAnalysis: any
) => {
  const sampleTranscript = TEST_SAMPLE_TRANSCRIPT;

  const { tone: overallTone, score: overallScore } =
    determineOverallTone(sentimentAnalysis);

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

1. Emotional State of the Client (This section should be based on the content of what the client expressed, highlighting how the client feels about themselves and their experiences.)
2. Main Topics Discussed
3. Therapeutic Techniques Used
4. Client's Progress and Goals
5. Challenges and Concerns
6. Therapist's Recommendations

Each section should start with the title on a new line. The summary should be clear and concise, addressing only relevant information.

Please return the summary in plain text format, with each section title clearly separated from its content.
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
    <h4>Client's Emotional Tone</h4>
    <p><em>This score represents the client's overall emotional tone on a scale from 1 to 100, where: 1-30 indicates a negative tone, 31-70 indicates a neutral tone and 71-100 indicates a positive tone.</em></p>
    <p>${overallTone} (Score: ${overallScore}/100)</p>
    
    <h4>Emotional State of the Client</h4>
    <p>${extractSection(content, "Emotional State of the Client")}</p>
    <h4>Main Topics Discussed</h4>
    <p>${extractSection(content, "Main Topics Discussed")}</p>
    <h4>Therapeutic Techniques Used</h4>
    <p>${extractSection(content, "Therapeutic Techniques Used")}</p>
    <h4>Client's Progress and Goals</h4>
    <p>${extractSection(content, "Client's Progress and Goals")}</p>
    <h4>Challenges and Concerns</h4>
    <p>${extractSection(content, "Challenges and Concerns")}</p>
    <h4>Therapist's Recommendations</h4>
    <p>${extractSection(content, "Therapist's Recommendations")}</p></div>
  `;

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
    `${sectionTitle}\\s*:?\\s*(.*?)(?=\\n\\d\\.|\\nTherapist's Recommendations|$)`,
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
