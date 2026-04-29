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

    // Test TRPC login endpoint
    const trpcLoginResponse = await fetch(`${baseUrl}/api/trpc/customAuth.login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          username: "superadmin",
          password: "admin123",
          expectedRole: "super_admin"
        }
      })
    });
    console.log("TRPC login endpoint:", trpcLoginResponse.status);

    if (trpcLoginResponse.ok) {
      const trpcLoginData = await trpcLoginResponse.json();
      console.log("TRPC login successful:", trpcLoginData.result.data);
    } else {
      const errorData = await trpcLoginResponse.text();
      console.log("TRPC login failed:", errorData);
    }

  } catch (err) {
    console.error("API test failed:", err);
  }
}

testAPI();