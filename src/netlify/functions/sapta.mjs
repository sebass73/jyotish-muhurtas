import { ejecutarJSON } from "../../services/core.js";

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  try {
    const data = await ejecutarJSON(params.ciudad, params.pais, params.fecha);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
