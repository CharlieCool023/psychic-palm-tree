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

    // Test login endpoint
    const loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "superadmin",
        password: "admin123",
        expectedRole: "super_admin"
      })
    });
    console.log("Login endpoint:", loginResponse.status);

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log("Login successful:", loginData.result.data);
    } else {
      const errorData = await loginResponse.text();
      console.log("Login failed:", errorData);
    }

  } catch (err) {
    console.error("API test failed:", err);
  }
}

testAPI();