export const T = {
  es: {
    title: "Calculadora de Muhurtas",
    city: "Ciudad",
    country: "País",
    calc: "Calcular",
    loading: "Calculando…",
    copyLink: "Copiar enlace",
    exportCSV: "Exportar CSV",
    success: "✅ Listo!",
    errFetch: "❌ Error al obtener datos",
    diagram: "Reloj Solar",
    map: "Ubicación",
    planets: {
      Sol: "Sol",
      Venus: "Venus",
      Mercurio: "Mercurio",
      Luna: "Luna",
      Saturno: "Saturno",
      Júpiter: "Júpiter",
      Marte: "Marte",
    },
    meta: {
      day: "Día",
      sunrise: "Amanecer",
      sunset: "Atardecer",
      solarArc: "Arco del Sol",
      daySlots: "Muhurta Día",
      nightSlots: "Muhurta Noche",
    },
  },
  en: {
    title: "Muhurtas Calculator",
    city: "City",
    country: "Country",
    calc: "Calculate",
    loading: "Loading…",
    copyLink: "Copy link",
    exportCSV: "Export CSV",
    success: "✅ Done!",
    errFetch: "❌ Error fetching data",
    diagram: "Solar Clock",
    map: "Location",
    planets: {
      Sol: "Sun",
      Venus: "Venus",
      Mercurio: "Mercury",
      Luna: "Moon",
      Saturno: "Saturn",
      Júpiter: "Jupiter",
      Marte: "Mars",
    },
    meta: {
      day: "Day",
      sunrise: "Sunrise",
      sunset: "Sunset",
      solarArc: "Solar Arc",
      daySlots: "Day Muhurta",
      nightSlots: "Night Muhurta",
    },
  },
  it: {
    title: "Calcolatore di Muhurta",
    city: "Città",
    country: "Paese",
    calc: "Calcola",
    loading: "Caricamento…",
    copyLink: "Copia link",
    exportCSV: "Esporta CSV",
    success: "✅ Fatto!",
    errFetch: "❌ Errore dati",
    diagram: "Orologio Solare",
    map: "Località",
    planets: {
      Sol: "Sole",
      Venus: "Venere",
      Mercurio: "Mercurio",
      Luna: "Luna",
      Saturno: "Saturno",
      Júpiter: "Giove",
      Marte: "Marte",
    },
    meta: {
      day: "Giorno",
      sunrise: "Alba",
      sunset: "Tramonto",
      solarArc: "Arco del Sole",
      daySlots: "Muhurta Giorno",
      nightSlots: "Muhurta Notte",
    },
  },
};

export function initI18n() {
  let lang = localStorage.getItem("lang") || "es";
  const apply = () => {
    document.title = T[lang].title;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = T[lang][el.getAttribute("data-i18n")];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = T[lang][el.getAttribute("data-i18n-placeholder")];
    });
  };
  const select = document.getElementById("lang");
  select.value = lang;
  select.addEventListener("change", (e) => {
    lang = e.target.value;
    localStorage.setItem("lang", lang);
    apply();
  });
  apply();
}
