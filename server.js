import express from "express";
import cors from "cors";
const { format } = await import("date-fns");

const app = express();

app.use(cors());

app.get("/sapta/json", async (req, res, next) => {
  const { ciudad, pais } = req.query;
  const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
  if (!ciudad || !pais) {
    return res
      .status(400)
      .json({ error: "ciudad, pais y fecha son requeridos" });
  }

  try {
    const { obtenerDatosSol } = await import("./src/services/sunCalc.js");
    const { generarSaptaKrama } = await import("./src/services/saptaKrama.js");

    const { latitude, longitude, timezone, sunriseLocal, sunsetLocal } =
      await obtenerDatosSol(ciudad, pais, fecha);

    const durMin = (sunsetLocal - sunriseLocal) / 12 / 60000;
    const weekday = new Date(fecha).toLocaleString("en-US", {
      timeZone: timezone,
      weekday: "long",
    });

    const saptaKrama = generarSaptaKrama(sunriseLocal, durMin, weekday);

    res.json({
      fecha,
      saptaKrama,
      ciudad,
      pais,
      latitude,
      longitude,
      sunrise: format(sunriseLocal, "HH:mm"),
      sunset: format(sunsetLocal, "HH:mm"),
    });
  } catch (err) {
    next(err);
  }
});

export default app;
