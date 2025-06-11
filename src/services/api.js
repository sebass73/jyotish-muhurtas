export async function fetchMuhurtas(params) {
  const res = await fetch(`/sapta/json?${new URLSearchParams(params)}`);
  if (!res.ok) throw new Error("Fetch error");
  const data = await res.json();
  return data;
}
