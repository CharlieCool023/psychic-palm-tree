import "dotenv/config";

async function testAPI() {
  const baseUrl = "https://nyscondoeval.vercel.app";

  try {
    console.log("Testing API endpoints...");

    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    console.log("Health endpoint:", healthResponse.status);

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("Health data:", healthData);
    }

    // Test TRPC endpoint
    const trpcResponse = await fetch(`${baseUrl}/api/trpc/ping`);
    console.log("TRPC ping endpoint:", trpcResponse.status);

    if (trpcResponse.ok) {
      const trpcData = await trpcResponse.json();
      console.log("TRPC data:", trpcData);
    }

  } catch (err) {
    console.error("API test failed:", err);
  }
}

testAPI();