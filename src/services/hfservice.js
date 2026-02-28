import axios from "axios";

const HF_API_TOKEN = process.env.HF_API_TOKEN;

export const analyzeTextHF = async (text) => {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/mrm8488/bert-tiny-finetuned-fake-news-detection",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
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