"use server";

import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const summarizeTranscribedText = async (transcript: string) => {
  const messages = [
    {
      role: "system",
      content:
        "You are an expert evaluator of therapy sessions. Your task is to assess and summarize the session based on the provided transcript.",
    },
    {
      role: "user",
      content: `
      Please summarize the following therapy session transcript by focusing on the most important aspects and formatting it as structured content that fits into predefined sections:
      1. Summarize the emotional state of the client and any significant emotional changes.
      2. List the main topics discussed by the client (e.g., mental health concerns, relationships, work stress).
      3. Describe any therapeutic techniques or exercises used by the therapist.
      4. Mention the client's progress, goals set, or milestones achieved.
      5. Note challenges or concerns raised by the client that require attention in future sessions.
      6. Summarize the therapist's recommendations or advice to the client.
      Please provide each section clearly so it can be inserted into predefined HTML sections.
      `,
    },
    {
      role: "user",
      content: transcript,
    },
  ];

  try {
    console.log("starting openai chat request");
    console.log("transcript before chatgpt", transcript);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any,
      max_tokens: 500,
    });
    console.log("finished openai chat request");

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response choices returned from OpenAI.");
    }

    const content = response.choices[0].message?.content?.trim();
    if (!content) {
      throw new Error("Empty response content from OpenAI.");
    }

    const htmlContent = `
      <div><h3>Therapy Session Summary</h3>
      <h4>Emotional State of the Client</h4>
      <p>${extractSection(content, "1.")}</p>
      <h4>Main Topics Discussed</h4>
      <p>${extractSection(content, "2.")}</p>
      <h4>Therapeutic Techniques Used</h4>
      <p>${extractSection(content, "3.")}</p>
      <h4>Progress and Goals</h4>
      <p>${extractSection(content, "4.")}</p>
      <h4>Challenges and Concerns</h4>
      <p>${extractSection(content, "5.")}</p>
      <h4>Therapist's Recommendations</h4>
      <p>${extractSection(content, "6.")}</p></div>
    `;

    return htmlContent;
  } catch (error) {
    console.error("Error summarizing transcribed text:", error);
    return `<p>Unable to generate a summary at this time. Please try again later.</p>`;
  }
};

// Helper function to extract content for each section based on numbering
function extractSection(content: string, section: string): string {
  const regex = new RegExp(`${section}\\s*(.*?)\\s*(?=\\d+\\.)`, "s");
  const match = content.match(regex);
  return match
    ? match[1].trim()
    : "No valuable information from the client was provided for this section.";
}
