export async function fetchMuhurtas({ ciudad, pais, fecha, usarHora  }) {
  const qs = new URLSearchParams({ ciudad, pais, fecha, usarHora }).toString();
  const res = await fetch(`/.netlify/functions/sapta?${qs}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al obtener datos");
  }
  return res.json();
}
