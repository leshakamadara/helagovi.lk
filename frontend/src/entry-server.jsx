import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";

export function render(url) {
  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
        <Toaster />
      </StaticRouter>
    </React.StrictMode>
  );
  return { html };
}