const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateEmbedding(text, maxRetries = 5) {
  // Exact Hugging Face endpoints to use
  const endpoints = [
    "https://router.huggingface.co/hf-inference/models/BAAI/bge-large-en-v1.5/pipeline/feature-extraction",
    "https://router.huggingface.co/hf-inference/models/intfloat/e5-large-v2/pipeline/sentence-similarity"
  ];

  const timeout = 60000; // 60 seconds timeout

  // Try with primary endpoint first
  let currentEndpointIndex = 0;
  let lastError = null;

  while (currentEndpointIndex < endpoints.length) {
    const currentEndpoint = endpoints[currentEndpointIndex];

    // Attempt with the current endpoint
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(
          `Attempting to use endpoint: ${currentEndpoint} (attempt ${attempt}/${maxRetries})`
        );

        const response = await fetch(currentEndpoint, {
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
            `Service unavailable (503) for endpoint ${currentEndpoint}, retrying with longer delay...`
          );
          const serviceUnavailableDelay = 15000 * attempt; // Longer delay for 503s
          await wait(serviceUnavailableDelay);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Handle different response formats
        let embeddings;
        if (Array.isArray(result)) {
          embeddings = result;
        } else if (result && typeof result === "object") {
          if (result.embeddings) {
            embeddings = result.embeddings;
          } else if (result.vectors) {
            embeddings = result.vectors;
          } else {
            throw new Error("Unexpected response format");
          }
        } else {
          throw new Error("Invalid response format");
        }

        // Verify we have valid embeddings
        if (!Array.isArray(embeddings) || embeddings.length === 0) {
          throw new Error("No valid embeddings in response");
        }

        console.log(`Successfully generated embeddings using ${currentEndpoint}`);
        return embeddings;
      } catch (error) {
        lastError = error;
        console.error(
          `Embedding generation attempt ${attempt}/${maxRetries} with endpoint ${currentEndpoint} failed:`,
          error.message
        );

        // If this is the last attempt with this endpoint, prepare to try the next endpoint
        if (attempt === maxRetries) {
          console.warn(
            `All attempts with endpoint ${currentEndpoint} failed, trying next endpoint if available...`
          );
          break; // Break out of attempts loop to try next endpoint
        }

        // Exponential backoff with jitter
        const baseDelay = Math.min(2000 * Math.pow(2, attempt), 30000);
        const jitter = Math.random() * 2000;
        await wait(baseDelay + jitter);
      }
    }

    // Move to next endpoint
    currentEndpointIndex++;
  }

  // If we've tried all endpoints and still failed
  throw new Error(
    `Failed to generate embedding after trying all available endpoints. Last error: ${lastError?.message}`
  );
}
