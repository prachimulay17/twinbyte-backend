import axios from "axios";

const prompt = `
You are an AI system that detects misinformation, especially targeting rural India.

Return ONLY valid JSON:

{
  "result": "short explanation",
  "riskScore": 50,
  "confidence": 80
}

Content:
Text: "vaccines cause autism"
`;

try {
    const response = await axios.post("http://localhost:11434/api/generate", {
        model: "mistral",
        prompt,
        stream: false,
    });

    const rawText = response.data.response;
    console.log("=== RAW RESPONSE ===");
    console.log(JSON.stringify(rawText));
    console.log("=== CLEANED ===");
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    console.log(cleaned);
    console.log("=== PARSED ===");
    const parsed = JSON.parse(cleaned);
    console.log(parsed);
} catch (err) {
    console.error("ERROR:", err.message);
    if (err.response) {
        console.error("Axios response error:", JSON.stringify(err.response.data));
    }
}
