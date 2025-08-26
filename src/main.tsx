import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import Boot from "./Boot";
import { bootstrapSession } from "@/lib/session";

(async () => {
  await bootstrapSession(); // hidrata user/loading
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Boot />
      <App />
    </React.StrictMode>
  );
})();
