import App from './App'; // Changed from named import { App } to default import App
import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App"; // Removed the duplicate commented-out import
import "./index.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);