import { analyzeContent } from "../services/ai.service.js";

export const analyzeMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    const aiRawResponse = await analyzeContent(message);

    let cleaned = aiRawResponse.trim();

    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json|```/g, "").trim();
    }

    const analysis = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      ...analysis
    });

  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};