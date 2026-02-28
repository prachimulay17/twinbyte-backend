import axios from "axios";

const HF_API_TOKEN = process.env.HF_API_TOKEN;

export const analyzeTextHF = async (text) => {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli",
      {
        inputs: text,
        parameters: {
          candidate_labels: ["real news", "fake news"]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json"   // 🔥 IMPORTANT FIX
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error(
      "HuggingFace Error:",
      error.response?.data || error.message
    );
    throw new Error("HF analysis failed");
  }
};