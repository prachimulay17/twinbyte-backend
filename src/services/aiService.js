import axios from "axios";

export const analyzeText = async (text) => {
  try {
    const prompt = `
You are an AI system that detects misinformation patterns,
especially in rural India.

Return ONLY JSON:

{
  "emotional_score": number (0-100),
  "urgency_score": number (0-100),
  "unverified_claim_score": number (0-100),
  "panic_score": number (0-100),
  "overall_risk": number (0-100),
  "explanation": "short explanation"
}

Message:
"${text}"
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "mistral",
        prompt: prompt,
        stream: false
      }
    );

    return response.data.response;

  } catch (error) {
    console.error("Ollama Error:", error.message);
    throw new Error("AI analysis failed");
  }
};