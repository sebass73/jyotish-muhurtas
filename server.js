import express from "express";
import cors from "cors";
const { format } = await import("date-fns");

const app = express();

app.use(cors());

app.get("/sapta/json", async (req, res, next) => {
  const { ciudad, pais, fecha } = req.query;
  if (!ciudad || !pais || !fecha) {
    return res
      .status(400)
      .json({ error: "ciudad, pais y fecha son requeridos" });
  }

  try {
    const { obtenerDatosSol } = await import("./src/services/sunCalc.js");
    const { generarSaptaKrama } = await import("./src/services/saptaKrama.js");

    // Datos del Sol con azimut y punto cardinal
    const {
      latitude,
      longitude,
      timezone,
      sunriseDate,
      sunsetDate,
      sunriseAzimuth,
      sunriseDirection,
      sunsetAzimuth,
      sunsetDirection,
    } = await obtenerDatosSol(ciudad, pais, fecha);
    
    // Cálculo de muhûrtas
    const durMin = (sunsetDate - sunriseDate) / 60000 / 12;
    const weekday = new Date(fecha).toLocaleString("en-US", {
      timeZone: timezone,
      weekday: "long",
    });
    const saptaKrama = generarSaptaKrama(sunriseDate, durMin, weekday);

    // Respuesta JSON
    res.json({
      ciudad,
      pais,
      fecha,
      latitude,
      longitude,
      timezone,

      sunrise: {
        time: format(sunriseDate, "HH:mm"),
        azimuth: Math.round(sunriseAzimuth * 10) / 10,
        direction: sunriseDirection,
      },
      sunset: {
        time: format(sunsetDate, "HH:mm"),
        azimuth: Math.round(sunsetAzimuth * 10) / 10,
        direction: sunsetDirection,
      },

      saptaKrama,
    });
  } catch (err) {
    next(err);
  }
});

export default app;
