# Bugs encontrados — Jyotish Muhurtas

Análisis estático del código fuente. Severidad: 🔴 crítico · 🟡 medio · 🟢 bajo.

---

## 🔴 CRÍTICOS

### Bug #1 — Errores del backend no se muestran al usuario
**Archivo**: `src/components/Form.js:16`

```js
showError(msg) {
  /* TODO: implementar UI de error */
}
```

`showError` está vacío. Cuando el backend falla (ciudad no encontrada, JPL Horizons
caído, error de red), `main.js` llama `this.form.showError(err.message)` y el usuario
no ve nada. El loader desaparece y la pantalla queda vacía sin explicación.

**Impacto**: El usuario no sabe si escribió mal la ciudad o si hay un error del servidor.

---

### Bug #2 — `obtenerDatosSol` se llama dos veces por cada cálculo
**Archivo**: `src/netlify/functions/sapta.mjs:12-14`

```js
const base = await ejecutarJSON(ciudad, pais, fecha);   // llama obtenerDatosSol internamente
const sol  = await obtenerDatosSol(ciudad, pais, fecha); // segunda llamada idéntica
```

`core.js` ya invoca `obtenerDatosSol` para calcular los muhûrtas. `sapta.mjs` la llama
de nuevo solo para obtener los azimuts. Esto genera **dos requests a Nominatim** (geocoding)
y **dos cálculos de SunCalc** para la misma ciudad y fecha.

**Impacto**: Tiempo de respuesta innecesariamente duplicado. Nominatim tiene rate-limiting
y puede rechazar la segunda petición si vienen muy seguidas.

---

### Bug #3 — 10 peticiones a JPL Horizons en serie (no en paralelo)
**Archivo**: `src/netlify/functions/sapta.mjs:49-52`

```js
for (const [name, id] of Object.entries(bodies)) {
  const dec = await fetchEclLon(id, startStr, stopStr);  // await dentro del for
  astro[name] = toZodiacPosition(dec);
}
```

Las 10 peticiones HTTP a NASA JPL Horizons se ejecutan de forma **secuencial**.
Cada petición tarda ~1-2 segundos. El tiempo total es ~10-20 segundos innecesarios.

**Fix**: Reemplazar con `Promise.all` para peticiones en paralelo.

---

### Bug #4 — Cambio de idioma emite `themeChange` en lugar de re-renderizar contenido
**Archivo**: `src/utils/i18n.js:262-263`

```js
select.addEventListener("change", (e) => {
  lang = e.target.value;
  localStorage.setItem("lang", lang);
  apply();
  window.dispatchEvent(new CustomEvent("themeChange")); // ← incorrecto
});
```

Cuando el usuario cambia el idioma, `i18n.js` emite `themeChange`. El listener de
`themeChange` en `main.js` solo redibuja el diagrama de azimuts, el chart y la rueda
zodiacal. Las **cards, la tabla de efemérides y el resumen del día NO se re-renderizan**.

Esto funciona porque `main.js` también tiene su propio listener en el `<select>` que
llama `renderContent()`. El problema es que `themeChange` por el cambio de idioma
causa un **redibujado innecesario doble** del diagrama y la rueda zodiacal.

---

### Bug #5 — `this.pts` puede ser `undefined` en `ZodiacChart._onMouseMove`
**Archivo**: `src/components/ZodiacChart.js:64,84`

```js
// constructor:
this.canvas.addEventListener("mousemove", (e) => this._onMouseMove(e)); // listener activo
this.resizeAndDraw(); // nunca llama draw(), pts jamás se inicializa

// _onMouseMove:
for (const pt of this.pts) { // TypeError si el mouse se mueve antes del primer render
```

El constructor registra el evento `mousemove` y luego llama `resizeAndDraw()` sin
posiciones. `this.pts` nunca se inicializa hasta que `draw()` es llamado. Si el usuario
mueve el mouse sobre el canvas antes del primer cálculo (canvas vacío), se lanza un
`TypeError: Cannot read properties of undefined (reading 'Symbol(Symbol.iterator)')`.

**Fix**: Inicializar `this.pts = []` en el constructor.

---

### Bug #6 — `saptaKrama` con día en inglés incorrecto devuelve planeta equivocado
**Archivo**: `src/services/saptaKrama.js:12-20,37`

```js
const DIA_PLANETA = {
  Monday: "Luna", Tuesday: "Marte", Wednesday: "Mercurio",
  Thursday: "Júpiter", Friday: "Venus", Saturday: "Saturno", Sunday: "Sol",
};
// ...
const primerPlaneta = opts.startPlanet ?? DIA_PLANETA[opts.diaSemana];
```

`diaSemana` se genera en `core.js` con Luxon en locale `"en"`: `toFormat("cccc")`.
Luxon en locale inglés devuelve el día con la primera letra en mayúscula (ej. `"Thursday"`),
lo que coincide con `DIA_PLANETA`. **Sin embargo**, si por cualquier razón Luxon devuelve
el nombre en minúsculas o en otro locale, `DIA_PLANETA[diaSemana]` sería `undefined`,
`PLANET_CYCLE.indexOf(undefined)` devuelve `-1`, y `slice(-1).concat(slice(0, -1))`
produce un ciclo que empieza en **Marte** en lugar del planeta correcto.

No hay validación ni fallback explícito.

---

## 🟡 MEDIOS

### Bug #7 — `getFechaFinal()` se llama en el constructor pero el resultado no se usa
**Archivo**: `src/main.js:22-23`

```js
const fechaFinal = this.getFechaFinal();
console.log("Fecha final a usar:", fechaFinal);
```

`fechaFinal` se calcula y loguea pero nunca se usa. El valor real de la fecha se
re-calcula en el submit a través de `FormData`. Código muerto con `console.log` en
producción.

---

### Bug #8 — El mapa no tiene método `clear()` pero se llama desde `_clearAll`
**Archivo**: `src/main.js:247` y `src/components/MapDisplay.js`

```js
// main.js _clearAll():
this.map.clear?.();  // el ?. evita el crash, pero el mapa anterior queda visible
```

`MapDisplay` no tiene método `clear()`. El mapa se destruye correctamente en
`update()` cuando llega el nuevo resultado, pero entre que el usuario presiona
"Calcular" y que llegan los datos, el mapa anterior sigue visible (mientras el
resto de la UI ya fue limpiada).

---

### Bug #9 — Urano, Neptuno y Plutón no tienen traducción en `i18n.js`
**Archivo**: `src/utils/i18n.js:21-29`

```js
planets: {
  Sol, Venus, Mercurio, Luna, Saturno, Júpiter, Marte  // solo los 7 del Sapta Krama
}
```

`astroPositions` devuelve 10 planetas. Para Urano, Neptuno y Plutón,
`planetsNames[pl]` es `undefined`. Los componentes hacen `planetsNames[pl] || pl`,
mostrando el nombre **siempre en español** independientemente del idioma activo.

**Afecta**: `AstroTable.js`, `ZodiacChart.js` (tooltips).

---

### Bug #10 — Solapamiento de planetas en la rueda solo corrige al planeta inmediato anterior
**Archivo**: `src/components/ZodiacChart.js:196-215`

```js
for (let i = 1; i < arr.length; i++) {
  const prev = arr[i - 1];
  const curr = arr[i];
  if (Math.hypot(dx, dy) < MIN_DIST) {
    r += MIN_DIST; // solo mueve curr respecto a prev
  }
}
```

Si hay 3 o más planetas en el mismo signo muy juntos, el algoritmo solo corrige la
distancia entre pares consecutivos. El segundo planeta puede seguir solapando con el
tercero después de la corrección.

Además, `r += MIN_DIST` puede superar `this.radius`, dibujando el planeta **fuera
del círculo** zodiacal.

---

### Bug #11 — El tooltip de la rueda zodiacal tiene fondo blanco hardcodeado en dark mode
**Archivo**: `src/components/ZodiacChart.js:274`

```js
ctx.fillStyle = "rgba(255,255,255,0.9)";  // siempre blanco
ctx.fillStyle = "#2c3e50";                // texto siempre oscuro
```

En modo oscuro el fondo del tooltip es blanco con texto oscuro, lo que genera un
parche de alto contraste que no respeta el tema visual.

---

### Bug #12 — `ChartDisplay.update()` asigna `options` directamente en Chart.js
**Archivo**: `src/components/ChartDisplay.js:73`

```js
this.chart.options = config.options;
this.chart.data = config.data;
this.chart.update();
```

Chart.js no garantiza que reemplazar `.options` directamente sea equivalente a
inicializarlo en el constructor. En versiones recientes de Chart.js, la forma
correcta de actualizar opciones sin destruir la instancia es mutar las propiedades
individuales o usar `Chart.helpers.merge`. Puede causar que los colores de las
etiquetas (dependientes de dark mode) no se actualicen correctamente.

---

### Bug #13 — `ZodiacChart` registra múltiples listeners `resize` sin cleanup
**Archivo**: `src/components/ZodiacChart.js:73`

```js
window.addEventListener("resize", () => this.resizeAndDraw());
```

Cada vez que el usuario hace un cálculo, `renderContent()` puede crear una nueva
instancia de `ZodiacChart` (actualmente protegido por `if (!this.zodiac)`), pero si
ese guard se quita o si el componente se reutiliza, cada instancia agrega un nuevo
listener a `window`. Actualmente no hay problema, pero es frágil.

---

## 🟢 BAJOS

### Bug #14 — Clase CSS `júpiter` con tilde en `Cards.js`
**Archivo**: `src/components/Cards.js:17`

```js
el.className = `card ${m.planeta?.toLowerCase() || ""}`;
// → "card júpiter" — la 'ú' hace que la clase CSS sea inválida en algunos contextos
```

`"júpiter".toLowerCase()` produce `"júpiter"`. Los selectores CSS con caracteres
no-ASCII requieren escape (`\00fa piter`). Si hay estilos vinculados a `.júpiter`
pueden no aplicarse en ciertos navegadores o preprocessors.

---

### Bug #15 — `PLANET_SYMBOLS` y `formatter.js` son código muerto
**Archivos**: `src/utils/constants.js:1-11`, `src/utils/formatter.js`

`PLANET_SYMBOLS` (array) se exporta desde `constants.js` pero no se importa en
ningún componente de la app (los símbolos se redefinen localmente en `AstroTable.js`
y `ZodiacChart.js`).

`formatter.js` exporta `mostrarSalida()` que formatea la salida como texto plano
para consola. No se importa ni se usa en la app web. Es código legado de cuando la
app funcionaba como script de CLI.

---

### Bug #16 — El selector de idioma tiene `Italiano` pero la constitución solo declara ES/EN
**Archivos**: `index.html:86-88`, `src/utils/i18n.js:152-226`

El italiano existe en `i18n.js` y en el selector HTML pero la constitución del
proyecto (v1.0.0) define el soporte como bilingüe ES/EN. Hay desalineación entre
la constitución y la implementación real. No es un bug funcional, pero indica que
el italiano puede tener menor mantenimiento.

---

### Bug #17 — `console.log` de debug en producción
**Archivo**: `src/main.js:16,23,171,183,202,208,222,228,239`

Hay múltiples `console.log` que exponen información de estado interno en producción:
`"Initializing MuhurtaApp..."`, `"Fecha final a usar: ..."`,
`"Calculating time slots..."`, `"Rendering metadata..."`, etc.

---

## Resumen por severidad

| Severidad | Cantidad | Bugs |
|-----------|----------|------|
| 🔴 Crítico | 6 | #1, #2, #3, #4, #5, #6 |
| 🟡 Medio   | 7 | #7, #8, #9, #10, #11, #12, #13 |
| 🟢 Bajo    | 4 | #14, #15, #16, #17 |

## Orden de prioridad de corrección sugerido

1. **#1** — Mostrar errores al usuario (UX bloqueante)
2. **#3** — Paralelizar peticiones a JPL Horizons (performance crítica)
3. **#5** — Inicializar `this.pts = []` en ZodiacChart (crash potencial)
4. **#2** — Eliminar segunda llamada a `obtenerDatosSol`
5. **#9** — Agregar Urano/Neptuno/Plutón a los objetos de traducción
6. **#4** — Separar evento de cambio de idioma de `themeChange`
7. **#8** — Implementar `MapDisplay.clear()` o limpiar el contenedor del mapa
