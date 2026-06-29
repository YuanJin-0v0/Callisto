import { useEffect, useRef } from "react";

type PetState = "idle" | "blink" | "happy" | "sleep" | "notice";

interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
  duration: number;
}

const SPRITES: Record<PetState, Frame[]> = {
  idle: [
    { x: 0, y: 0, w: 32, h: 32, duration: 2000 },
    { x: 32, y: 0, w: 32, h: 32, duration: 200 },
  ],
  blink: [
    { x: 0, y: 0, w: 32, h: 32, duration: 3000 },
    { x: 64, y: 0, w: 32, h: 32, duration: 150 },
    { x: 0, y: 0, w: 32, h: 32, duration: 3000 },
  ],
  happy: [
    { x: 0, y: 32, w: 32, h: 32, duration: 400 },
    { x: 32, y: 32, w: 32, h: 32, duration: 400 },
    { x: 64, y: 32, w: 32, h: 32, duration: 400 },
  ],
  sleep: [
    { x: 0, y: 64, w: 32, h: 32, duration: 1500 },
    { x: 32, y: 64, w: 32, h: 32, duration: 1500 },
  ],
  notice: [
    { x: 0, y: 96, w: 32, h: 32, duration: 600 },
    { x: 32, y: 96, w: 32, h: 32, duration: 600 },
  ],
};

function generatePetSprites(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  const drawPixel = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * 4, y * 4, 4, 4);
  };

  const colors = {
    body: "#c0775a",
    dark: "#8b4a3a",
    light: "#e0a080",
    eye: "#2b1b17",
    white: "#f0d5b0",
    ear: "#8b4a3a",
    nose: "#d4886a",
  };

  const drawCat = (ox: number, oy: number, eyesOpen: boolean, earUp: boolean) => {
    const bx = ox / 4;
    const by = oy / 4;

    const p = (px: number, py: number, color: string) => drawPixel(bx + px, by + py, color);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (y === 0) {
          if ((x === 2 || x === 5) && earUp) p(x, y, colors.ear);
          else if (x === 2 || x === 5) p(x, y, colors.dark);
        } else if (y === 1) {
          if (x === 1 || x === 6) p(x, y, colors.ear);
          else if (x >= 2 && x <= 5) p(x, y, colors.body);
        } else if (y >= 2 && y <= 4) {
          if (x >= 1 && x <= 6) p(x, y, colors.body);
        } else if (y >= 5 && y <= 6) {
          if (x >= 2 && x <= 5) p(x, y, colors.body);
        } else if (y === 7) {
          if (x >= 3 && x <= 4) p(x, y, colors.body);
        }
      }
    }

    if (eyesOpen) {
      p(2, 3, colors.white); p(5, 3, colors.white);
      p(3, 3, colors.eye);  p(4, 3, colors.eye);
    } else {
      p(2, 3, colors.body); p(5, 3, colors.body);
      p(3, 3, colors.body); p(4, 3, colors.body);
    }

    p(2, 2, colors.ear); p(5, 2, colors.ear);
    p(3, 4, colors.nose);
    p(3, 5, colors.light); p(4, 5, colors.light);
  };

  const drawSleep = (ox: number, oy: number) => {
    const bx = ox / 4;
    const by = oy / 4;

    const p = (px: number, py: number, color: string) => drawPixel(bx + px, by + py, color);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (y >= 2 && y <= 5) {
          if (x >= 1 && x <= 6) p(x, y, colors.body);
        } else if (y === 6) {
          if (x >= 2 && x <= 5) p(x, y, colors.body);
        }
      }
    }

    p(2, 2, colors.dark); p(5, 2, colors.dark);
    p(3, 4, colors.nose);
    p(3, 5, colors.light); p(4, 5, colors.light);
  };

  const drawNotice = (ox: number, oy: number, _tilted: boolean) => {
    const bx = ox / 4;
    const by = oy / 4;

    const p = (px: number, py: number, color: string) => drawPixel(bx + px, by + py, color);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (y === 0) {
          if (x === 2 || x === 5) p(x, y, colors.ear);
        } else if (y === 1) {
          if (x === 1 || x === 6) p(x, y, colors.ear);
          else if (x >= 2 && x <= 5) p(x, y, colors.body);
        } else if (y >= 2 && y <= 4) {
          if (x >= 1 && x <= 6) p(x, y, colors.body);
        } else if (y >= 5 && y <= 6) {
          if (x >= 2 && x <= 5) p(x, y, colors.body);
        } else if (y === 7) {
          if (x >= 3 && x <= 4) p(x, y, colors.body);
        }
      }
    }

    p(2, 3, colors.white); p(5, 3, colors.white);
    p(3, 3, colors.eye);  p(4, 3, colors.eye);
    p(2, 2, colors.ear); p(5, 2, colors.ear);
    p(3, 4, colors.nose);
    p(3, 5, colors.light); p(4, 5, colors.light);
  };

  drawCat(0, 0, true, true);
  drawCat(32, 0, true, false);
  drawCat(64, 0, false, true);
  drawCat(0, 32, true, true);
  drawCat(32, 32, true, true);
  drawCat(64, 32, true, true);
  drawSleep(0, 64);
  drawSleep(32, 64);
  drawNotice(0, 96, false);
  drawNotice(32, 96, true);

  return canvas.toDataURL();
}

interface PetCanvasProps {
  state: PetState;
}

export default function PetCanvas({ state }: PetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteUrlRef = useRef<string>("");
  const frameIdxRef = useRef(0);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (!spriteUrlRef.current) {
      spriteUrlRef.current = generatePetSprites();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.src = spriteUrlRef.current;

    const frames = SPRITES[state] || SPRITES.idle;
    frameIdxRef.current = 0;

    const render = () => {
      if (!ctx || !img.complete) return;
      ctx.clearRect(0, 0, 128, 128);
      ctx.imageSmoothingEnabled = false;

      const frame = frames[frameIdxRef.current];
      if (frame) {
        ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h, 0, 0, 128, 128);
      }

      frameIdxRef.current = (frameIdxRef.current + 1) % frames.length;
      timerRef.current = window.setTimeout(render, frames[frameIdxRef.current]?.duration ?? 500);
    };

    render();

    return () => clearTimeout(timerRef.current);
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={128}
      style={{
        width: 128,
        height: 128,
        cursor: "pointer",
        imageRendering: "pixelated",
      }}
    />
  );
}
