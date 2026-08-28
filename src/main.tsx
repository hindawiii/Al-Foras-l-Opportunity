import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { guestStorage } from "./lib/guestStorage";

// Permanent dark mode — enforce on boot before React mounts.
document.documentElement.classList.add("dark");
document.documentElement.classList.remove("light");

// استرجاع البيانات من IndexedDB (نسخة احتياطية) قبل الإقلاع.
guestStorage.hydrate().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
