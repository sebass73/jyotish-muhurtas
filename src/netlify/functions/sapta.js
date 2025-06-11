// netlify/functions/sapta.js
const { ejecutarJSON } = require("../../services/core");

exports.handler = async (event, context) => {
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
