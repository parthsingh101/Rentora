const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function register(formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");
  const phone = formData.get("phone");

  if (!name || !email || !password || !role) {
    return { error: "Missing required fields" };
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        phone,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return { success: "User registered successfully", user: data.user };
    }

    return { error: data.message || "Failed to register user" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to connect to auth server" };
  }
}
