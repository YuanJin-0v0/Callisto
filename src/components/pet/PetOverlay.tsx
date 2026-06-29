import { useEffect, useState, useCallback, useRef } from "react";
import PetCanvas from "./PetCanvas";
import PetBubble from "./PetBubble";

type PetState = "idle" | "blink" | "happy" | "sleep" | "notice";

const GREETINGS = ["主人好~", "回来啦！", "想你了~", "喵~"];

const IDLE_BUBBLES = ["今天玩什么呢？", "好无聊~", "发会呆...", "", "", ""];

export default function PetOverlay() {
  const [state, setState] = useState<PetState>("idle");
  const [bubble, setBubble] = useState({ text: "", visible: false });
  const dragRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const showBubble = useCallback((text: string, duration = 3000) => {
    setBubble({ text, visible: true });
    setTimeout(() => setBubble((b) => ({ ...b, visible: false })), duration);
  }, []);

  useEffect(() => {
    showBubble(GREETINGS[Math.floor(Math.random() * GREETINGS.length)], 4000);
  }, [showBubble]);

  useEffect(() => {
    if (state !== "idle") return;
    const interval = setInterval(() => {
      const r = Math.random();
      if (r < 0.1) {
        setState("blink");
        setTimeout(() => setState("idle"), 200);
      } else if (r < 0.15) {
        const t = IDLE_BUBBLES[Math.floor(Math.random() * IDLE_BUBBLES.length)];
        if (t) showBubble(t, 4000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [state, showBubble]);

  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    dragRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().startDragging();
    } catch {
      /* not in Tauri */
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = false;
  }, []);

  const handleClick = useCallback(() => {
    if (dragRef.current) return;
    setState("happy");
    showBubble("嘿嘿~", 2000);
    setTimeout(() => setState("idle"), 1500);
  }, [showBubble]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        userSelect: "none",
      }}
      onMouseUp={handleMouseUp}
    >
      <div
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "grab",
        }}
      >
        <PetBubble text={bubble.text} visible={bubble.visible} />
        <PetCanvas state={state} />
      </div>
    </div>
  );
}
