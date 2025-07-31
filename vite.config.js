import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  plugins: [
    {
      name: "express-middleware",
      async configureServer(server) {
        const { default: expressApp } = await import("./server.js");
        server.middlewares.use(expressApp);
      },
    },
  ],
});
