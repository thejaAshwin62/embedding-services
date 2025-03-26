import Together from "together-ai";

const together = new Together({
  apiKey: "979b843aaf6d7ffbd20372b34ea9b29c414becd66be461703992b4e58155a45c",
});

export async function generateCaptionFromText(text) {
  try {
    const contextClearingPrompt = `NEW CONTEXT - IGNORE ALL PREVIOUS INFORMATION
    
System: You are starting completely fresh. All previous contexts and responses are cleared.
Current Task: Generate a new description based ONLY on the following details:

${text}

Requirements:
- Generate a completely new description
- Do not reference any previous descriptions
- Focus only on the current details provided
- Make the response unique and fresh`;

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      messages: [
        {
          role: "system",
          content: "This is a new session. All previous context has been cleared.",
        },
        {
          role: "user",
          content: contextClearingPrompt,
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
      top_p: 1,
      frequency_penalty: 0.7,
      presence_penalty: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating fresh caption:", error);
    throw error;
  }
}
