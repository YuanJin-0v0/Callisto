export default function Home() {
  return (
    <div>
      <h2 style={{ margin: "0 0 16px", color: "var(--gold)", fontSize: 16 }}>
        Callisto
      </h2>
      <div className="grid-3">
        <div className="pixel-card">
          <div style={{ fontSize: 24, marginBottom: 4 }}>🎬</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>在追</div>
          <div style={{ fontSize: 20, color: "var(--gold)" }}>0</div>
        </div>
        <div className="pixel-card">
          <div style={{ fontSize: 24, marginBottom: 4 }}>🎮</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>游戏</div>
          <div style={{ fontSize: 20, color: "var(--gold)" }}>0</div>
        </div>
        <div className="pixel-card">
          <div style={{ fontSize: 24, marginBottom: 4 }}>🎵</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>已听</div>
          <div style={{ fontSize: 20, color: "var(--gold)" }}>0h</div>
        </div>
      </div>
    </div>
  );
}
