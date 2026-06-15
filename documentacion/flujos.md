# Flujos principales — Jyotish Muhurtas

## Flujo 1: Cálculo de Muhûrtas (flujo principal)

```
Usuario completa el formulario (ciudad, país, fecha/hora)
        │
        ▼
Form.js → onSubmitCallback({ ciudad, pais, fecha, usarHora })
        │
        ▼
main.js → fetchMuhurtas(params)         [src/services/api.js]
        │   GET /.netlify/functions/sapta?ciudad=...&pais=...&fecha=...
        │
        ▼
sapta.mjs (Netlify Function)
  ├─ ejecutarJSON(ciudad, pais, fecha)  [src/services/core.js]
  │     ├─ obtenerDatosSol()            [src/services/sunCalc.js]
  │     │     ├─ Nominatim geocoding → lat/lon
  │     │     ├─ tz-lookup → timezone IANA
  │     │     └─ SunCalc.getTimes() → sunrise/sunset + azimuts
  │     │
  │     ├─ generarSaptaKrama(sunriseDate, arcoMin/12, tz, {diaSemana})
  │     │     └─ 12 muhûrtas diurnos con planeta, inicio, fin
  │     │
  │     └─ generarSaptaKrama(sunsetDate, nocheMin, tz, {startPlanet})
  │           └─ 12 muhûrtas nocturnos
  │
  ├─ obtenerDatosSol() [segunda llamada, solo para azimuts]
  │
  └─ fetchEclLon() × 10 planetas       [src/services/horizons.js]
        └─ NASA JPL Horizons API → longitud eclíptica → signo zodiacal
        
        │
        ▼
JSON response:
  { ciudad, pais, fecha, latitude, longitude, timezone, diaSemana,
    sunrise: { time, azimuth, direction },
    sunset:  { time, azimuth, direction },
    arcoSol, muhurtaDia, muhurtaNoche, primerPlaneta,
    saptaKramaDia[12], saptaKramaNoche[12],
    astroPositions: { Sol, Luna, ..., Plutón → { sign, deg, min, sec } } }
        │
        ▼
main.js → renderContent()
  ├─ Resumen del día       → div#saptaMeta (texto inline)
  ├─ Cards diurnas         → Cards.render(saptaKramaDia)
  ├─ Cards nocturnas       → Cards.render(saptaKramaNoche)
  ├─ Gráfico doughnut      → ChartDisplay.update(saptaKramaDia)
  ├─ Diagrama de azimuts   → drawAzimuths({ sunriseAz, sunsetAz, ... })
  ├─ Tabla de efemérides   → renderAstroTable("astroTable", astroPositions)
  ├─ Rueda zodiacal        → ZodiacChart.resizeAndDraw(astroPositions)
  └─ Mapa interactivo      → MapDisplay.update(lat, lon, ciudad, pais)
```

---

## Flujo 2: Cambio de idioma

```
Usuario selecciona idioma en <select id="lang">
        │
        ├─ Listener en i18n.js → apply() [actualiza data-i18n en el DOM]
        │                      → dispatchEvent("themeChange")  ⚠️ ver Bug #4
        │
        └─ Listener en main.js → translateUI()   [duplica apply()]
                               → renderContent() [si hay datos previos]
```

---

## Flujo 3: Cambio de tema (dark/light mode)

```
Usuario hace click en #darkToggle
        │
        ▼
darkMode.js → toggle class "dark" en <html>
           → localStorage.setItem("dark", ...)
           → dispatchEvent("themeChange")
        │
        ▼
main.js → listener "themeChange"
  ├─ drawAzimuths()          [redibuja SVG con colores del tema]
  ├─ ChartDisplay.update()   [redibuja doughnut con colores del tema]
  └─ ZodiacChart.resizeAndDraw() [redibuja canvas con colores del tema]
```

---

## Flujo 4: Interacción con la rueda zodiacal

```
ZodiacChart constructor
  ├─ Agrega listeners: mousemove, mouseleave, click, touchstart, resize
  └─ resizeAndDraw() sin posiciones (canvas vacío)

Al recibir astroPositions (desde renderContent):
  └─ resizeAndDraw(astroPositions) → draw(astroPositions)
       ├─ Calcula posición angular de cada planeta (0-360°)
       ├─ Corrige solapamientos por signo (algoritmo simplificado)
       ├─ Dibuja líneas de aspecto (conjunción, trígono, cuadratura, etc.)
       ├─ Dibuja punto rojo por planeta
       └─ Dibuja tooltips (en mobile: todos; en desktop: solo el hovered)

Mousemove:
  └─ _onMouseMove() → busca planeta dentro de 10px del cursor
                    → si cambió: resizeAndDraw() para mostrar tooltip
```

---

## Flujo 5: Input de fecha/hora

```
Al cargar la app:
  initFechaHoraInput()
  ├─ Lee estado del checkbox #usarHora
  ├─ Si ON  → input type="datetime-local", valor = ahora (HH:mm)
  └─ Si OFF → input type="date", valor = hoy

Al calcular (submit):
  getFechaFinal()
  ├─ Si usarHora ON  → usa fechaInput.value directamente (incluye hora)
  └─ Si usarHora OFF → concatena fechaInput.value + dataset.horaActual
                       (la hora que tenía el input cuando se cambió a modo fecha)
```

---

## Flujo 6: Algoritmo Sapta Krama

```
Entrada: sunriseDate (Date), muhurtaDurMin (número), timezone (IANA), opts

1. Determinar primer planeta:
   - Si opts.diaSemana → DIA_PLANETA[diaSemana]
     (Monday→Luna, Tuesday→Marte, ..., Sunday→Sol)
   - Si opts.startPlanet → usar ese directamente

2. Rotar PLANET_CYCLE desde el primer planeta:
   PLANET_CYCLE = [Sol, Venus, Mercurio, Luna, Saturno, Júpiter, Marte]

3. Generar 12 muhûrtas:
   muhurta[i] = {
     muhurta: i+1,
     planeta: fullCycle[i % 7],
     inicio: startTime + i * muhurtaDurMin (en timezone local),
     fin:    startTime + (i+1) * muhurtaDurMin
   }

Para la noche:
   lastDayPlanet = saptaKramaDia[11].planeta
   nextStartPlanet = PLANET_CYCLE[(indexOf(lastDayPlanet) + 1) % 7]
   → generarSaptaKrama(sunsetDate, nocheMin, tz, { startPlanet: nextStartPlanet })
```
