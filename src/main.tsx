import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initServiceWorkerCleanup } from "./utils/serviceWorkerCleanup";

// Clean up problematic service workers on app startup
initServiceWorkerCleanup().catch(console.warn);

createRoot(document.getElementById("root")!).render(<App />);
