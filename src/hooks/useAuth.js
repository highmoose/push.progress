// API Hook for Authentication

export async function login(username, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Login failed");
  }

  return data.data;
}
