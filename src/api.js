async function login() {
  const res = await fetch("http://localhost:8000/api/api-token-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "YOUR_USERNAME", password: "YOUR_PASSWORD" }),
  });

  const data = await res.json();
  console.log("status:", res.status, "data:", data);

  if (res.ok) localStorage.setItem("token", data.token);
}
