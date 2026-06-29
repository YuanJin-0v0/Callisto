import { BrowserRouter } from "react-router";
import Dashboard from "./components/layout/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}
