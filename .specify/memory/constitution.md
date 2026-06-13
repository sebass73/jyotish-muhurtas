<!--
## Sync Impact Report
**Version change**: template (unversioned) → 1.0.0
**Modified principles**: N/A (initial authoring from blank template)
**Added sections**:
  - Core Principles (5 principios)
  - Technical Constraints
  - Development Workflow
  - Governance
**Removed sections**: Ninguna (template reemplazado por primera version real)
**Templates requiring updates**:
  - .specify/templates/plan-template.md ✅ — La sección "Constitution Check" es genérica
    y referencia la constitución de forma dinámica; no requiere cambios estructurales.
  - .specify/templates/spec-template.md ✅ — Template genérico; sin referencias a principios
    específicos que actualizar.
  - .specify/templates/tasks-template.md ✅ — Template genérico; sin referencias a principios
    específicos que actualizar.
  - README.md ⚠️ — El README menciona Chart.js para la rueda zodiacal, pero el código usa
    Canvas nativo (ZodiacChart). También indica soporte de italiano que ya no existe en i18n.js.
    Actualizar para alinear con el estado actual del código.
**Follow-up TODOs**: Ninguno — todos los campos resueltos.
-->

# Jyotish Muhurtas Constitution

## Core Principles

### I. Precisión Astronómica Primero

Los cálculos astronómicos DEBEN ser correctos antes que convenientes. Las fuentes de datos
son autoritativas y no pueden sustituirse por aproximaciones:

- Los horarios de amanecer/atardecer y azimuts solares DEBEN provenir de la librería
  SunCalc (`src/services/sunCalc.js`).
- Las posiciones zodiacales de los 10 cuerpos celestes (Sol, Luna, Mercurio, Venus, Marte,
  Júpiter, Saturno, Urano, Neptuno, Plutón) DEBEN consultarse a NASA JPL Horizons en
  tiempo real para la fecha/hora solicitadas.
- El algoritmo Sapta Krama DEBE respetar la tradición védica exactamente: el primer planeta
  del día lo determina el señor del día (`DIA_PLANETA`), el ciclo nocturno comienza desde
  el planeta siguiente al último muhûrta diurno.
- Las duraciones de muhûrta DEBEN calcularse dividiendo el arco solar en 12 partes iguales
  para el día y el tiempo restante hasta el amanecer siguiente en 12 para la noche.

**Rationale**: La razón de ser de la aplicación es proveer cálculos védicos precisos. Un
resultado astrológicamente incorrecto es más dañino que ningún resultado.

### II. Mínima Dependencia

El proyecto DEBE mantenerse libre de frameworks UI y de gestión de estado. Se permiten
librerías utilitarias específicas ya presentes (Luxon, date-fns, Leaflet, SunCalc, axios,
tz-lookup), pero cada nueva dependencia requiere justificación explícita.

- NO se DEBE introducir un framework UI (React, Vue, Angular, Svelte, etc.).
- NO se DEBE introducir una base de datos, ORM o store de estado global.
- Toda nueva dependencia DEBE superar el criterio: ¿aporta precisión astronómica o
  funcionalidad esencial que no puede lograrse con menos de ~50 líneas de vanilla JS?
- Las dependencias de desarrollo (Vite, Netlify CLI) no aplican a esta restricción.

**Rationale**: El stack Vanilla JS + Vite + Netlify Functions es suficiente para el dominio.
Cada dependencia adicional introduce deuda de mantenimiento y nuevas superficies de fallo.

### III. Thin Backend / Rich Client

El backend (`src/netlify/functions/sapta.mjs`) DEBE ser un proxy thin: orquesta llamadas
a APIs externas y devuelve un único JSON consolidado. Toda lógica de presentación y
formateo visual vive exclusivamente en el cliente.

- La función `sapta.mjs` NO DEBE contener lógica de presentación, formateo de strings
  para la UI, ni cálculos que dependan del estado del DOM.
- La lógica de negocio astronómica (Sapta Krama, conversiones zodiacales) PUEDE residir
  en `src/services/` e importarse desde la función serverless.
- El contrato del response JSON DEBE ser estable; cambios breaking requieren revisión
  explícita de todos los componentes consumidores antes del deploy.
- El backend DEBE ser stateless: ninguna petición DEBE depender del estado de una
  petición anterior.

**Rationale**: Separa las responsabilidades claramente, facilita el desarrollo y testing
independiente de la UI, y permite futuros clientes alternativos sin modificar el backend.

### IV. Internacionalización Liviana

El soporte bilingüe (ES/EN) DEBE implementarse únicamente mediante el objeto de
traducciones en `src/utils/i18n.js`. No se DEBE introducir ninguna librería i18n externa.

- Todos los strings visibles al usuario DEBEN existir en ambas claves de idioma (`es`, `en`).
- El idioma activo DEBE leerse de `localStorage` con fallback a `"es"`.
- Los componentes DEBEN recibir el string ya traducido como parámetro; NO DEBEN hacer
  lookups de i18n internamente.
- El idioma activo DEBE propagarse correctamente al re-renderizar contenido dinámico
  (cambio de idioma en caliente vía el evento del selector).

**Rationale**: El conjunto de strings es pequeño, estático y bajo control total del
proyecto. Una librería i18n añadiría complejidad sin beneficio real para este dominio.

### V. Visualización Nativa

Las visualizaciones específicas del dominio (rueda zodiacal, diagrama de azimuts)
DEBEN implementarse con APIs nativas del navegador: Canvas API para gráficos de dibujo
libre, SVG para diagramas vectoriales. Leaflet es la única excepción permitida para
mapas interactivos.

- NO se DEBEN introducir librerías de charting genéricas (Chart.js, D3, ECharts, etc.).
- Cada componente de visualización DEBE redibujarse correctamente al cambiar el tema
  dark/light escuchando el evento `themeChange` (ver `src/main.js`).
- El Canvas de la rueda zodiacal DEBE responder al resize del contenedor invocando
  `resizeAndDraw` tras hacer visible su contenedor en el DOM.
- Los colores DEBEN leerse del tema activo en el momento del dibujo, nunca hardcodeados.

**Rationale**: Las visualizaciones del dominio (rueda zodiacal védica, diagrama de azimuts
solar) no se mapean a librerías genéricas sin pérdida de control o precisión representativa.
Vanilla Canvas/SVG ofrece control total sobre cada pixel y vector.

## Technical Constraints

- **Stack**: Vanilla JS (ES modules), Vite (bundler/dev server), Netlify (hosting + Functions).
- **Runtime cliente**: Navegador moderno con soporte ES2020+ y Canvas API.
- **Runtime servidor**: Node.js 18+ en Netlify Functions.
- **Zona horaria**: Toda fecha/hora DEBE manejarse con Luxon y zona IANA explícita.
  Queda prohibido usar `new Date()` directo para cálculos de muhûrtas o posiciones.
- **APIs externas**: SunCalc (npm, client-side/server-side), NASA JPL Horizons (HTTP,
  server-side). Los fallos de estas APIs DEBEN propagarse como errores descriptivos
  al usuario, nunca silenciarse.
- **Geocodificación**: Nominatim (OpenStreetMap) vía `src/services/sunCalc.js`.
- **Despliegue**: `netlify deploy --prod`. No hay pipeline CI/CD automatizado; cada
  feature se valida manualmente en el navegador antes del deploy.
- **Persistencia**: Ninguna server-side. Las preferencias (idioma, tema) viven en
  `localStorage`; el estado de sesión en memoria del cliente.

## Development Workflow

- Toda modificación a `src/services/core.js` o `src/services/saptaKrama.js` DEBE
  verificarse contra al menos dos combinaciones ciudad/fecha conocidas para validar
  la precisión del cálculo.
- Los cambios al contrato JSON de `sapta.mjs` DEBEN coordinarse con todos los
  componentes consumidores (`Cards`, `ChartDisplay`, `ZodiacChart`, `AzimuthDiagram`,
  `AstroTable`, `MapDisplay`) antes de hacer deploy.
- Las visualizaciones DEBEN probarse en modo oscuro y claro después de cada cambio.
- Los commits DEBEN ser atómicos y descriptivos; el idioma preferido es español.
- Toda feature DEBE probarse manualmente en el navegador cubriendo: golden path,
  cambio de idioma en caliente, y toggle de tema dark/light.

## Governance

Esta constitución es el documento rector del proyecto Jyotish Muhurtas. Prevalece sobre
cualquier convención implícita o preferencia del momento.

**Procedimiento de enmienda**:
1. Identificar el principio afectado y documentar la motivación del cambio.
2. Actualizar este archivo con el bump de versión correspondiente.
3. Propagar cambios a templates y docs referenciados (ver Sync Impact Report).
4. Hacer commit con mensaje: `docs: amend constitution to vX.Y.Z (descripción breve)`.

**Política de versiones semánticas**:
- MAJOR: Remoción o redefinición incompatible con backward-compatibility de un principio.
- MINOR: Adición de principio nuevo o sección materialmente expandida.
- PATCH: Clarificaciones, correcciones de redacción, refinamientos no semánticos.

**Cumplimiento**: Cada feature plan (`/speckit-plan`) DEBE incluir un "Constitution Check"
verificando que la propuesta no viola ninguno de los 5 principios. Las violaciones
necesitan justificación explícita en la tabla de Complexity Tracking del plan.

**Version**: 1.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
