# Muhurta Calculator

A comprehensive web application to calculate and visualize **Muhurtas** (traditional Vedic time divisions) based on sunrise and sunset times for any location and date.

## 🔧 Technologies Used

- **JavaScript (ES6 Modules)**: Core language for both frontend and backend.
- **Node.js**: Backend runtime environment.
- **Vite**: Fast development build tool and dev server.
- **Express**: Local development API server (integrated via Vite middleware).
- **Netlify Functions**: Serverless backend for production deployments.
- **Axios**: HTTP client for making API requests.
- **CORS**: Middleware to enable cross-origin requests.
- **date-fns**: Date parsing and formatting utilities.
- **Luxon**: Advanced date and time handling.
- **tz-lookup**: Determine timezone from geographic coordinates.
- **Leaflet**: Interactive map display (OpenStreetMap tiles).
- **Chart.js** & **chartjs-plugin-datalabels**: Rendering of the zodiac wheel and data labels.
- **flatpickr**: Lightweight, internationalized date picker.
- **CSS**: Custom styles under `src/styles`.
- **Netlify CLI**: Local emulation of Netlify build and functions.

## 🚀 Features

- **Day & Night Muhurtas**: Divide daylight and nighttime into 12 equal segments and display start/end times.
- **Sapta Krama Sequence**: Traditional planetary sequence for each muhurta based on the weekday.
- **Multi-language Support**: UI available in **Spanish**, **English**, and **Italian** (via `utils/i18n.js`).
- **Dark Mode**: Toggleable theme stored in local storage (`utils/darkMode.js`).
- **Interactive Solar Clock**: SVG diagram showing sunrise/sunset azimuths.
- **Location Map**: Pinpoint location using Leaflet and OpenStreetMap.
- **Astro Table**: Ephemeris-style table for planetary zodiacal positions.
- **Zodiac Wheel**: Radial Chart.js visualization of the zodiac and planets.
- **CSV Export & Shareable Link**: Copy link to current results or export muhurta data.
- **Responsive UI**: Built with Vite, hot-reloading, and mobile-friendly layouts.

## 📂 Project Structure

```bash
.
├── public/
│   └── images/                # Static assets (e.g., photos, icons)
├── src/                       # Source code
│   ├── components/            # UI components (Form, Cards, Charts, Map, etc.)
│   ├── services/              # API & computation services (geocoding, sun times, sapta krama)
│   ├── utils/                 # Helpers (i18n, dark mode)
│   ├── styles/                # CSS files
│   └── netlify/functions/     # Serverless function(s) for production API
│       └── sapta.js           # Entry point for Muhurta JSON API
│   └── main.js                # App initialization and orchestration
├── index.html                 # Frontend template (markdown-based layout)
├── server.js                  # Express server for local development
├── vite.config.js             # Vite configuration (includes Express middleware)
├── netlify.toml               # Netlify build & functions settings
├── package.json               # NPM scripts & dependencies
└── .gitignore                 # Ignored files & folders
```

## ⚙️ Installation & Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sebass73/jyotish-muhurtas.git
   cd jyotish-muhurtas
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run in development mode**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - API (Express): http://localhost:5173/sapta/json

4. **Build for production**
   ```bash
   npm run build
   ```
   - Outputs static assets in `dist/`
   - Deploy to Netlify via the `publish = "dist"` setting.

5. **Local Netlify emulation**
   ```bash
   npm run dev  # Uses Netlify CLI to serve both frontend and functions at :8888
   ```

## 🔍 Usage

1. Open the app in your browser.
2. Select a **date** and **enter a city & country**.
3. Choose your **language** from the dropdown (ES, EN, IT).
4. Submit the form to view:
   - **Daytime & nighttime muhurta tables**
   - **Planetary sequence** for each segment
   - **Solar clock** with azimuth directions
   - **Zodiac wheel** and **astro table**
   - **Map** of the selected location
5. Use **"Copy Link"** to share or **Export CSV** for offline analysis.

## 🛠️ Configuration

- No API keys are required; relies on public endpoints:
  - **Nominatim** (OpenStreetMap) for geocoding
  - **Sunrise-Sunset API** for solar times
- **Netlify Functions** directory is configured in `netlify.toml`.
- **Vite** middleware loads `server.js` for local API handling.

---
*Created with ❤️ by Sukhadeva Dharmanath & the Sangha Dharma Nath community*
