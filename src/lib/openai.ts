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

  const formattedSentiments = TEST_SAMPLE_SENTIMENT_ANALYSIS.map(
    (message: any) =>
      `- "${message.content}" (Sentiment: ${message.sentiment}, Score: ${message.score})`
  ).join("\n");

  const messages = [
    {
      role: "system",
      content:
        "You are an expert evaluator of therapy sessions. Your task is to assess and summarize the session based on the provided transcript and sentiment analysis.",
    },
    {
      role: "user",
      content: `
      The following transcript is a therapy session between a client and a therapist. The conversation alternates between them, and the therapist typically provides guidance, techniques, or suggestions, while the client expresses feelings, concerns, or experiences. 
      
      The sentiment analysis uses a scoring system to represent the emotional intensity or strength of the sentiment. This score is in the range [-1, 1]:
      - A score below -0.3 indicates a negative (sad/angry) sentiment.
      - A score above 0.3 indicates a positive (joyful/happy) sentiment.
      - Scores between -0.3 and 0.3 indicate a neutral sentiment.
      
      Based on the transcript and sentiment indicators, please summarize the session with the following structured sections:
      1. Patient's Mood and Emotional Tone (based on sentiment analysis)
      2. Emotional State of the Client
      3. Main Topics Discussed
      4. Therapeutic Techniques Used
      5. Client's Progress and Goals
      6. Challenges and Concerns
      7. Therapist's Recommendations
      
      Use the following sentiment data for reference:
      ${formattedSentiments}
      
      Please return the summary in plain text format, **without using a colon after the section labels**, and ensure that each section begins directly with the relevant content.
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
      <h4>Patient's Mood and Emotional Tone</h4>
      <p>${extractSection(content, "Patient's Mood and Emotional Tone")}</p>
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
// Helper function to extract content based on labeled sections
function extractSection(content: string, sectionTitle: string): string {
  const regex = new RegExp(`${sectionTitle}\\s*(.*?)(?=\\d\\.|$)`, "s"); // Extract until next numbered section or end
  const match = content.match(regex);

  if (match) {
    let extractedContent = match[1].trim();

    // Remove any instances of markdown formatting like ** or unnecessary symbols
    extractedContent = extractedContent.replace(/\*\*/g, "").trim();

    return extractedContent;
  }

  return "No valuable information was provided for this section.";
}

export default openai;
