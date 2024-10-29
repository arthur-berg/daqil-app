import { Pinecone } from "@pinecone-database/pinecone";
import openai from "./openai";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

export const upsertJournalNoteToPinecone = async (
  clientId: string,
  text: string,
  appointmentId: string,
  therapistId: string
) => {
  try {
    const embedding = await embedText(text);
    const clientInsightsIndex = pc.Index("client-insights");

    await clientInsightsIndex.namespace(clientId).upsert([
      {
        id: `journal_note_${appointmentId}_${Date.now()}`,
        values: embedding,
        metadata: {
          therapistId,
          appointmentId,
          date: new Date().toISOString(),
          type: "journal_note",
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
    const clientInsightsIndex = pc.Index("client-insights");

    const response = await clientInsightsIndex.namespace(clientId).query({
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
