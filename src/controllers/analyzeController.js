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

    const labels = hfResult.labels;
    const scores = hfResult.scores;

    const fakeIndex = labels.indexOf("fake news");
    const fakeScore = scores[fakeIndex];

    const riskScore = Math.round(fakeScore * 100);

    let riskCategory = "Low";
    if (riskScore >= 70) riskCategory = "High";
    else if (riskScore >= 40) riskCategory = "Medium";

    return res.status(200).json({
      success: true,
      risk_score: riskScore,
      risk_category: riskCategory,
      explanation:
        riskCategory === "High"
          ? "The content is likely misleading or inconsistent with factual reporting."
          : "The content does not strongly resemble fake news patterns."
    });

  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};