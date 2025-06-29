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
    planetaryPositions: "Posiciones Planetarias",
    zodiacWheel: "Rueda Zodiacal",
    table: {
      planet: "Planeta",
      sign: "Signo",
      degrees: "Grados",
      minutes: "Minutos",
      seconds: "Segundos",
    },
    signs: {
      Aries: "Aries",
      Tauro: "Tauro",
      Géminis: "Géminis",
      Cáncer: "Cáncer",
      Leo: "Leo",
      Virgo: "Virgo",
      Libra: "Libra",
      Escorpio: "Escorpio",
      Sagitario: "Sagitario",
      Capricornio: "Capricornio",
      Acuario: "Acuario",
      Piscis: "Piscis",
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
    planetaryPositions: "Planetary Positions",
    zodiacWheel: "Zodiac Wheel",
    table: {
      planet: "Planet",
      sign: "Sign",
      degrees: "Degrees",
      minutes: "Minutes",
      seconds: "Seconds",
    },
    signs: {
      Aries: "Aries",
      Tauro: "Taurus",
      Géminis: "Gemini",
      Cáncer: "Cancer",
      Leo: "Leo",
      Virgo: "Virgo",
      Libra: "Libra",
      Escorpio: "Scorpio",
      Sagitario: "Sagittarius",
      Capricornio: "Capricorn",
      Acuario: "Aquarius",
      Piscis: "Pisces",
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
    planetaryPositions: "Posizioni Planetarie",
    zodiacWheel: "Ruota Zodiacale",
    table: {
      planet: "Pianeta",
      sign: "Segno",
      degrees: "Gradi",
      minutes: "Minuti",
      seconds: "Secondi",
    },
    signs: {
      Aries: "Ariete",
      Tauro: "Toro",
      Géminis: "Gemelli",
      Cáncer: "Cancro",
      Leo: "Leone",
      Virgo: "Vergine",
      Libra: "Bilancia",
      Escorpio: "Scorpione",
      Sagitario: "Sagittario",
      Capricornio: "Capricorno",
      Acuario: "Acquario",
      Piscis: "Pesci",
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
