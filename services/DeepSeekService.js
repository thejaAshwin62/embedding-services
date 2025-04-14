import Together from "together-ai";

const together = new Together({
  apiKey: "979b843aaf6d7ffbd20372b34ea9b29c414becd66be461703992b4e58155a45c",
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
