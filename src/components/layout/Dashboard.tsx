import { Suspense } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import { routes } from "../../routes";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">Callisto</div>
        <nav className="sidebar-nav">
          {routes.map((r) => (
            <button
              key={r.path}
              className={`nav-item${location.pathname === r.path ? " active" : ""}`}
              onClick={() => navigate(r.path)}
            >
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <header className="header">
          <span className="header-title">
            {routes.find((r) => r.path === location.pathname)?.label ?? "Callisto"}
          </span>
          <div className="header-actions">
            <button className="pixel-btn" onClick={() => navigate("/settings")}>⚙</button>
          </div>
        </header>
        <div className="content-area">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {routes.map((r) => (
                <Route
                  key={r.path}
                  path={r.path === "/" ? "/" : r.path}
                  element={<r.Component />}
                />
              ))}
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
