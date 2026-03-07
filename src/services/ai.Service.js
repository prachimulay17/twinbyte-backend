import axios from "axios";
import fs from "fs";
import FormData from "form-data";

/* ------------------ OCR FUNCTION ------------------ */

const extractTextFromImage = async (imagePath) => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));
    formData.append("apikey", process.env.OCR_SPACE_API_KEY);
    formData.append("language", "eng");

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

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
    return "";
  }
};

/* ------------------ HELPER ------------------ */

const clamp = (value, min = 0, max = 100) => {
  return Math.min(Math.max(value, min), max);
};

/* ------------------ MAIN ANALYSIS FUNCTION ------------------ */

export const analyzeContent = async ({
  text = "",
  imagePath = null,
  language = "English",
}) => {
  try {
    if (!text && !imagePath) {
      throw new Error("No content provided for analysis");
    }

    let finalText = text;

    // If image provided, extract text
    if (imagePath) {
      const extractedText = await extractTextFromImage(imagePath);
      finalText += "\n" + extractedText;
    }

    if (!finalText.trim()) {
      finalText =
        "No clearly readable text was found in the uploaded image.";
    }

    /* -------- LANGUAGE HANDLING -------- */

    const languageMap = {
      "en-IN": "English",
      "hi-IN": "Hindi",
      "mr-IN": "Marathi",
      English: "English",
      Hindi: "Hindi",
      Marathi: "Marathi",
    };

    const selectedLanguage = languageMap[language] || "English";

    /* -------- PROMPT FOR OLLAMA -------- */

    const prompt = `
You are an AI scam detection assistant.

Analyze the following message and return strictly in this format:

RESULT: (Safe / Moderate / High Risk)
RISK: (0-100)
CONFIDENCE: (0-100)
EXPLANATION: (Clear explanation)

IMPORTANT RULES:
- Respond strictly in ${selectedLanguage}.
- Do NOT mix languages.
- If ${selectedLanguage} is Hindi or Marathi, write in proper native script (NOT English transliteration).
- Keep explanation simple and rural-friendly.
- Always follow the exact output format.

Message:
"${finalText}"
`;

    /* -------- CALL OLLAMA -------- */

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "mistral", // change model if needed
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 300,
        },
      }
    );

    const rawText = response.data.response.trim();
    console.log("RAW MODEL OUTPUT:\n", rawText);

    /* -------- SAFE PARSING -------- */

    const resultMatch = rawText.match(/RESULT:\s*(.*)/i);
    const riskMatch = rawText.match(/RISK:\s*(\d+)/i);
    const confidenceMatch = rawText.match(/CONFIDENCE:\s*(\d+)/i);
    const explanationMatch = rawText.match(/EXPLANATION:\s*([\s\S]*)/i);

    if (
      !resultMatch ||
      !riskMatch ||
      !confidenceMatch ||
      !explanationMatch
    ) {
      throw new Error("Model response format invalid");
    }

    return {
      result: resultMatch[1].trim(),
      riskScore: clamp(Number(riskMatch[1])),
      confidence: clamp(Number(confidenceMatch[1])),
      explanation: explanationMatch[1].trim(),
    };
  } catch (error) {
    throw new Error("AI analysis failed: " + error.message);
  }
};