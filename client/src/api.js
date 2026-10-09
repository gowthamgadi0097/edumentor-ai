const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
export async function api(path, body) {
  const t = localStorage.getItem("token");
  const r = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(t && { Authorization: "Bearer " + t }) },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
