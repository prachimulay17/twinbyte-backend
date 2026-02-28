import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeText = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" }, // Forces JSON output
      messages: [
        {
          role: "system",
          content: `
You are an AI system designed to detect misinformation patterns,
especially in rural India.

Your task is NOT to fact-check the message.
Instead, detect linguistic and behavioral red flags.

Focus on:
- Emotional manipulation
- Fear-based tone
- Urgency language
- Unverifiable claims
- Panic-inducing content

Return strictly in JSON format.
`
        },
        {
          role: "user",
          content: `
Analyze the following message and provide:

{
  "emotional_score": number (0-100),
  "urgency_score": number (0-100),
  "unverifiable_claim_score": number (0-100),
  "panic_score": number (0-100),
  "overall_risk": number (0-100),
  "explanation": "short explanation why risk is high or low"
}

Message:
"${text}"
`
        }
      ]
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("OpenAI Service Error:", error);
    throw new Error("AI analysis failed");
  }
};