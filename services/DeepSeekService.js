import Together from "together-ai";

const together = new Together({
  apiKey: "6779af5f7fbb0fc8669014230ea4a357f4359d648b1c261b52241693347394c9",
});

export async function generateCaptionFromText(text) {
  try {
    const contextClearingPrompt = `NEW CONTEXT - IGNORE ALL PREVIOUS INFORMATION
    
System: You are starting completely fresh. All previous contexts and responses are cleared.
Current Task: Observe the given text and provide a short, crisp feedback.

${text}

Requirements:
- Keep the response short and sweet (max 4-6 sentences)
- Focus only on the key observations
- Be direct and concise
- No unnecessary details or explanations
- Make it easy to understand at a glance
- Format the response as a natural observation`;

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      messages: [
        {
          role: "system",
          content:
            "You are a concise observer. Provide short, clear feedback in a natural, observational style.",
        },
        {
          role: "user",
          content: contextClearingPrompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
    });

    if (!response?.choices?.[0]?.message?.content) {
      console.warn("No content in response from Together AI");
      return "A scene captured in the image.";
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating fresh caption:", error);
    return "A scene captured in the image.";
  }
}
