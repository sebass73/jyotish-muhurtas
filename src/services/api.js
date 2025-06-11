// export async function fetchMuhurtas(params) {
//   const res = await fetch(`/sapta/json?${new URLSearchParams(params)}`);
//   if (!res.ok) throw new Error("Fetch error");
//   const data = await res.json();
//   return data;
// }
// src/services/api.js
export async function fetchMuhurtas({ ciudad, pais, fecha }) {
  const qs = new URLSearchParams({ ciudad, pais, fecha }).toString();
  const res = await fetch(`/.netlify/functions/sapta?${qs}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al obtener datos");
  }
  return res.json();
}
