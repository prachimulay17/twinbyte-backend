import { analyzeTextHF } from "../services/hfservice.js";

export const analyzeMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    const hfResult = await analyzeTextHF(message);

    // Extract first prediction
    const predictions = hfResult[0];

    // Sort by highest score
    const topPrediction = predictions.sort((a, b) => b.score - a.score)[0];

    let riskScore = 0;
    let riskCategory = "Low";
    let explanation = "";

    if (topPrediction.label === "LABEL_1") {
      // Assume LABEL_1 = FAKE
      riskScore = Math.round(topPrediction.score * 100);
      riskCategory = "High";
      explanation = "The message matches patterns commonly found in fake news.";
    } else {
      riskScore = Math.round((1 - topPrediction.score) * 100);
      riskCategory = "Low";
      explanation = "The message appears consistent with real news patterns.";
    }

    return res.status(200).json({
      success: true,
      risk_score: riskScore,
      risk_category: riskCategory,
      explanation
    });

  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};