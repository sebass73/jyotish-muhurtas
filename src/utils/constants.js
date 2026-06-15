// Devuelve el índice del muhûrta activo en este momento.
// Maneja muhûrtas que cruzan medianoche (fin < inicio en minutos).
export function activeMuhurtaIndex(muhurtas) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  return muhurtas.findIndex((m) => {
    const start = toMin(m.inicio);
    const end   = toMin(m.fin);
    return end < start
      ? cur >= start || cur < end   // cruza medianoche
      : cur >= start && cur < end;
  });
}

function toMin(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export const PLANET_ICONS = {
  sol:       "☉",
  luna:      "☾",
  mercurio:  "☿",
  venus:     "♀",
  marte:     "♂",
  "júpiter": "♃",
  saturno:   "♄",
};

export const PLANET_SYMBOLS = [
  "☉",
  "☾",
  "☿",
  "♀",
  "♂",
  "♃",
  "♄",
  "♅",
  "♆",
  "♇",
];
export const PLANET_COLORS = {
  sol:      "#C8993A", // ámbar dorado
  venus:    "#B8667A", // rosa empolvado
  mercurio: "#4E7A5C", // verde salvia
  luna:     "#6B6EA8", // lavanda suave
  saturno:  "#8A7A6E", // taupe cálido
  júpiter:  "#B86E38", // naranja quemado
  marte:    "#A04848", // terracota
};
