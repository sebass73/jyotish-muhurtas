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
