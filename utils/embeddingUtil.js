const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateEmbedding(text, maxRetries = 3) {
  const url = "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/intfloat/multilingual-e5-large-instruct";
  const timeout = 30000; // 30 seconds timeout
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!Array.isArray(result)) {
        throw new Error('Invalid embedding format received');
      }

      return result;

    } catch (error) {
      console.error(`Embedding generation attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to generate embedding after ${maxRetries} attempts: ${error.message}`);
      }

      const baseDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
      const jitter = Math.random() * 1000;
      await wait(baseDelay + jitter);
    }
  }
}