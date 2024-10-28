import { Pinecone } from "@pinecone-database/pinecone";
import openai from "./openai";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

export const upsertToPinecone = async (
  clientId: string,
  text: string,
  appointmentId: string,
  therapistId: string
) => {
  try {
    const embedding = await embedText(text);
    const journalNotesIndex = pc.Index("journal-notes");

    await journalNotesIndex.upsert([
      {
        id: `journal_${clientId}_${Date.now()}`,
        values: embedding,
        metadata: {
          clientId,
          therapistId,
          appointmentId,
          date: new Date().toISOString(),
          type: "journal_summary",
        },
      },
    ]);
    console.log("Embedding upserted for client:", clientId);
  } catch (error) {
    console.error("Error upserting to Pinecone:", error);
  }
};

export const queryPinecone = async (clientId: string, queryText: string) => {
  try {
    const queryEmbedding = await embedText(queryText);
    const index = pc.Index("journal-notes");

    const response = await index.namespace(clientId).query({
      topK: 5,
      includeValues: false,
      includeMetadata: true,
      vector: queryEmbedding,
    });

    console.log("Query results:", response.matches);
    return response.matches.map((match) => match.metadata);
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    return [];
  }
};

export const embedText = async (text: string) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1536,
  });
  return response.data[0].embedding;
};

export default pc;
