import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LikesProvider } from "./components/LikesProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LikesProvider>
      <App />
    </LikesProvider>
  </StrictMode>,
);
