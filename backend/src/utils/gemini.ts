import axios from "axios";

export async function getTasks(topic: string): Promise<string[]> {
  const prompt = `Generate 5 actionable steps to learn about ${topic}. Return only the steps in seperate lines, no numbering or formatting.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env");
    throw new Error("API key missing");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    console.log("🔁 Sending request to Gemini with prompt:", prompt);
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error("❌ Gemini API responded but no text was found.");
      throw new Error("Empty content from Gemini");
    }

    console.log("✅ Gemini API Success:", rawText);
    return rawText.split("\n").filter((line: string) => line.trim() !== "");

  } catch (error: any) {
    console.error("❌ Gemini API Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
    throw new Error("Failed to generate tasks from Gemini API");
  }
}
