import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const summarizeTranscribedText = async (transcript: string) => {
  const sampleTranscript = `
I've been feeling really overwhelmed lately, especially with work... 
  `;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert evaluator of therapy sessions. Your task is to assess and summarize the session based on the provided transcript.",
    },
    {
      role: "user",
      content: `
The following transcript is a therapy session between a client and a therapist. The conversation alternates between them, and the therapist typically provides guidance, techniques, or suggestions, while the client expresses feelings, concerns, or experiences. Please summarize the transcript by focusing on the most important aspects and formatting it as structured content using the following sections:
1. Emotional State of the Client
2. Main Topics Discussed
3. Therapeutic Techniques Used
4. Client's Progress and Goals
5. Challenges and Concerns
6. Therapist's Recommendations
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
      max_tokens: 500,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response choices returned from OpenAI.");
    }

    const content = response.choices[0].message?.content?.trim();
    if (!content) {
      throw new Error("Empty response content from OpenAI.");
    }

    // Add the HTML structure after extracting the plain text sections
    const htmlContent = `
      <div><h3>Therapy Session Summary</h3>
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
