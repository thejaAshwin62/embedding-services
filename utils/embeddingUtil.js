const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateEmbedding(text, maxRetries = 5) {
  // All these models produce 1024-dimension embedding vectors
  const models = [
    "BAAI/bge-large-en-v1.5", // 1024 dimensions, excellent performance
    "intfloat/e5-large-v2", // 1024 dimensions, very strong performance
    "thenlper/gte-large", // 1024 dimensions, good for multilingual
    "Alibaba-NLP/gte-base-1024d", // Specifically designed for 1024d embeddings
  ];

  const timeout = 60000; // 60 seconds timeout

  // Try with primary model first
  let currentModelIndex = 0;
  let lastError = null;

  while (currentModelIndex < models.length) {
    const currentModel = models[currentModelIndex];
    const url = `https://router.huggingface.co/hf-inference/pipeline/feature-extraction/${currentModel}`;

    // Attempt with the current model
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(
          `Attempting to use 1024d model: ${currentModel} (attempt ${attempt}/${maxRetries})`
        );

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 503 specifically with longer backoff
        if (response.status === 503) {
          console.warn(
            `Service unavailable (503) for model ${currentModel}, retrying with longer delay...`
          );
          const serviceUnavailableDelay = 5000 * attempt; // Longer delay for 503s
          await wait(serviceUnavailableDelay);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the raw text first to debug
        const rawText = await response.text();

        // Try to parse the JSON
        let result;
        try {
          result = JSON.parse(rawText);

          // Debug the actual response structure
          console.log(`Response structure type: ${typeof result}`);
          //   if (typeof result === "object") {
          //     console.log(
          //       `Response has these keys: ${Object.keys(result).join(", ")}`
          //     );
          //   }

          // Handle different response formats
          if (Array.isArray(result)) {
            // Direct array format
            console.log(`Result is an array of length ${result.length}`);
            if (result.length > 0) {
              console.log(
                `First element is of type ${typeof result[0]} with length ${
                  Array.isArray(result[0]) ? result[0].length : "not an array"
                }`
              );
            }
          } else if (
            result &&
            typeof result === "object" &&
            result.embeddings
          ) {
            // Some models return an object with an embeddings property
            console.log(
              `Result has embeddings property, converting to standard format`
            );
            result = result.embeddings;
          } else if (result && typeof result === "object" && result.vectors) {
            // Some models return an object with a vectors property
            console.log(
              `Result has vectors property, converting to standard format`
            );
            result = result.vectors;
          }

          // Ensure we have an array at this point
          if (!Array.isArray(result)) {
            console.error(
              `Unexpected response format: ${rawText.substring(0, 200)}...`
            );
            throw new Error("Response is not in the expected array format");
          }

          // Verify dimensions of the first embedding vector if it exists
          if (result.length > 0 && Array.isArray(result[0])) {
            console.log(
              `Model ${currentModel} returned ${result[0].length}-dimension vectors`
            );
          } else if (result.length > 0) {
            console.log(`First element is not an array: ${typeof result[0]}`);
          }

          // Return the embeddings
          return result;
        } catch (jsonError) {
          console.error(`Failed to parse JSON response: ${jsonError.message}`);
          console.error(
            `Raw response (first 200 chars): ${rawText.substring(0, 200)}...`
          );
          throw new Error(
            `Invalid JSON response from API: ${jsonError.message}`
          );
        }
      } catch (error) {
        lastError = error;
        console.error(
          `Embedding generation attempt ${attempt}/${maxRetries} with model ${currentModel} failed:`,
          error.message
        );

        // If this is the last attempt with this model, prepare to try the next model
        if (attempt === maxRetries) {
          console.warn(
            `All attempts with model ${currentModel} failed, trying next model if available...`
          );
          break; // Break out of attempts loop to try next model
        }

        // Exponential backoff with jitter
        const baseDelay = Math.min(2000 * Math.pow(2, attempt), 30000);
        const jitter = Math.random() * 2000;
        await wait(baseDelay + jitter);
      }
    }

    // Move to next model
    currentModelIndex++;
  }

  // If we've tried all models and still failed
  throw new Error(
    `Failed to generate 1024-dimension embedding after trying all available models. Last error: ${lastError?.message}`
  );
}
