import axios from "axios";
import fs from "fs";
import FormData from "form-data";

/* ------------------ OCR FUNCTION ------------------ */

const extractTextFromImage = async (imagePath) => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));
    formData.append("apikey", process.env.OCR_SPACE_API_KEY); // Put key in .env
    formData.append("language", "eng");

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    console.log("OCR RAW RESPONSE:", response.data);

    if (
      !response.data ||
      !response.data.ParsedResults ||
      !response.data.ParsedResults[0]
    ) {
      throw new Error("OCR failed");
    }

    return response.data.ParsedResults[0].ParsedText || "";
  } catch (error) {
    console.error("OCR Error:", error.message);
    return ""; // fallback safely
  }
};

/* ------------------ MAIN ANALYSIS FUNCTION ------------------ */

export const analyzeContent = async ({ text = "", imagePath = null }) => {
  try {
    if (!text && !imagePath) {
      throw new Error("No content provided for analysis");
    }

    let finalText = text;

    if (imagePath) {
      const extractedText = await extractTextFromImage(imagePath);
      finalText += "\n" + extractedText;
    }

    if (!finalText.trim()) {
      finalText = "No clearly readable text was found in the uploaded image.";
    }

    const prompt = `
Analyze the content and respond in EXACT format:

RESULT: <Likely Fake / Possibly Misleading / Likely Real>
RISK: <number between 0 and 100>
CONFIDENCE: <number between 0 and 100>
EXPLANATION: <Exactly 3 sentences explaining reasoning in English>

Do not use JSON.
Do not add extra text.
Do not add markdown.

Content:
"${finalText}"
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "mistral",
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 300
        }
      }
    );

    const rawText = response.data.response.trim();
    console.log("RAW MODEL OUTPUT:\n", rawText);

    // Parse structured output safely
    const resultMatch = rawText.match(/RESULT:\s*(.*)/i);
    const riskMatch = rawText.match(/RISK:\s*(\d+)/i);
    const confidenceMatch = rawText.match(/CONFIDENCE:\s*(\d+)/i);
    const explanationMatch = rawText.match(/EXPLANATION:\s*([\s\S]*)/i);

    if (!resultMatch || !riskMatch || !confidenceMatch || !explanationMatch) {
      throw new Error("Model response format invalid");
    }

    return {
      result: resultMatch[1].trim(),
      riskScore: clamp(Number(riskMatch[1])),
      confidence: clamp(Number(confidenceMatch[1])),
      explanation: explanationMatch[1].trim()
    };

  } catch (error) {
    throw new Error("AI analysis failed: " + error.message);
  }
};