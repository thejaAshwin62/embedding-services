import Together from "together-ai";

const together = new Together({
  apiKey: "979b843aaf6d7ffbd20372b34ea9b29c414becd66be461703992b4e58155a45c",
});

export async function generateCaptionFromText(text) {
  try {
    // Clear context by creating a fresh conversation each time
    const clearContextPrompt = `Forget any previous descriptions or contexts. Focus only on this new scenario:

${text}

Generate a completely fresh description based solely on the details provided above. Do not reference or incorporate any previous descriptions.`;

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", // Updated to requested model
      messages: [
        {
          role: "system",
          content:
            "You are starting a new description. Disregard any previous context.",
        },
        {
          role: "user",
          content: clearContextPrompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      // Add these parameters to ensure fresh generation
      top_p: 1,
      frequency_penalty: 0.5, // Reduces likelihood of repeating similar patterns
      presence_penalty: 0.5, // Encourages new content
    });

    console.log(
      "Fresh caption generated:",
      response.choices[0].message.content
    );
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating fresh caption:", error);
    throw error;
  }
}

// import Together from "together-ai";

// const together = new Together({
//   apiKey: "979b843aaf6d7ffbd20372b34ea9b29c414becd66be461703992b4e58155a45c",
// });

// export async function generateCaptionFromText(text) {
//   try {
//     const response = await together.chat.completions.create({
//       model: "deepseek-ai/deepseek-llm-67b-chat",
//       messages: [
//         {
//           role: "user",
//           content: text,
//         },
//       ],
//       max_tokens: 500,
//     });

//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error("Error generating caption:", error);
//     throw error;
//   }
// }
