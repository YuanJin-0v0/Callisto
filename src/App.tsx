import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router";
import Dashboard from "./components/layout/Dashboard";
import PetOverlay from "./components/pet/PetOverlay";

type WindowType = "main" | "pet" | "unknown";

export default function App() {
  const [winType, setWinType] = useState<WindowType>("unknown");

  useEffect(() => {
    (async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const label = getCurrentWindow().label;
        setWinType(label as WindowType);
      } catch {
        setWinType("pet");
      }
    })();
  }, []);

  if (winType === "unknown") return null;

  if (winType === "pet") {
    return <PetOverlay />;
  }

  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}
