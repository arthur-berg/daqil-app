export const sendToRevAI = async (audioUrl: string) => {
  try {
    console.log("Sending audio to Rev.ai for transcription...");
    const response = await fetch("https://api.rev.ai/speechtotext/v1/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media_url: audioUrl,
        metadata: "Transcription for archive", // Optional metadata
      }),
    });

    console.log("response from rev ai");

    if (!response.ok) {
      throw new Error(`Failed to send audio to Rev.ai: ${response.status}`);
    }

    const data = await response.json();
    return data.id; // Return the Rev.ai job ID
  } catch (error) {
    console.error("Error sending to Rev.ai: ", error);
    throw new Error("Failed to send audio to Rev.ai");
  }
};
