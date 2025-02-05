import axios from "axios";

const RAPID_API_KEY = "9c90a63644mshd33164feab023dap15359djsn037c609dde2b";

export const translateText = async (text) => {
  if (!text.trim()) return "";

  const options = {
    method: "POST",
    url: "https://google-translate113.p.rapidapi.com/api/v1/translator/text",
    headers: {
      "x-rapidapi-key": RAPID_API_KEY,
      "x-rapidapi-host": "google-translate113.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      from: "auto",
      to: "en",
      text: text,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.translated_text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
};
