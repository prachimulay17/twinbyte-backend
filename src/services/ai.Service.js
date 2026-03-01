import axios from "axios";

/**
 * Analyze text and/or image using local Ollama (Mistral).
 */
export const analyzeContent = async ({ text = "", imagePath = null }) => {
    try {
        if (!text && !imagePath) {
            throw new Error("No content provided for analysis");
        }

        // Since Mistral (text model) does not analyze images directly,
        // we handle image by informing model that image was provided.
        const prompt = `
You are an AI misinformation detection system built for rural India.

Your task:
1. Detect whether the content contains misinformation.
2. Assign a risk score (0–100).
3. Provide a short, clear explanation.
4. The explanation MUST be in the SAME language as the input text.
   Supported languages: English, Hindi, Marathi.
5. If input language is Hindi or Marathi, respond fully in that language.
6. Explanation must directly refer to the content provided.
7. Do NOT give generic answers.
8. Do NOT include markdown.
9. Return ONLY valid JSON.

Output format:

{
  "result":"Likely Fake / Possibly Misleading / Likely Real",
  "riskScore": number (0-100),
  "confidence": number (0-100),
  "explanation": "2-3 sentence explanation in same language as input"
}

Content:
${text ? `Text: "${text}"` : ""}
${imagePath ? "An image screenshot was provided. Analyze visible misinformation patterns." : ""}
`;
        const response = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model: "mistral",
                prompt: prompt,
                stream: false,
            }
        );

        const rawText = response.data.response.trim();

        // Mistral sometimes wraps JSON in markdown OR adds extra prose around it.
        // Strategy: strip markdown fences first, then extract the first {...} block.
        const stripped = rawText.replace(/```json|```/g, "");
        const jsonMatch = stripped.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Ollama raw response (no JSON found):", rawText);
            throw new Error("Model did not return a valid JSON object");
        }
        const parsed = JSON.parse(jsonMatch[0]);

        return {
            result: parsed.explanation || parsed.result || "Analysis complete.",
            riskScore: clamp(Number(parsed.riskScore)),
            confidence: clamp(Number(parsed.confidence)),
        };

    } catch (error) {
        import('fs').then(fs => fs.appendFileSync('C:/tmp/ai_error2.log', '\n--- OLLAMA ERROR ---\n' + (error.stack || error.message) + '\n'));
        throw new Error("AI analysis failed: " + error.message);
    }
};

export const analyzeText = analyzeContent;

// ── Helpers ─────────────────────────────────────────────

function clamp(value) {
    if (isNaN(value)) return 50;
    return Math.min(100, Math.max(0, value));
}

