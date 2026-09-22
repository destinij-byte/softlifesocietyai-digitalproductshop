import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { API_BASE_URL } from "./api/client";
import "./theme/global.css";

// Fire-and-forget: nudges a sleeping Render instance awake as soon as the
// app loads, before the visitor has even reached a page that needs data.
fetch(`${API_BASE_URL}/health`).catch(() => {});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
