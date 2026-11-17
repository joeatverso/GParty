"use client";

import { useEffect, useRef } from "react";

const SPACING = 20;
const MAJOR_EVERY = 5;
const RADIUS = 180;
const PULL = 0.35;
const EASE = 0.12;
const MINOR_COLOR = "rgba(255, 255, 255, 0.05)";
const MAJOR_COLOR = "rgba(255, 255, 255, 0.12)";

export function GraphPaperBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let offsetX = new Float32Array(0);
    let offsetY = new Float32Array(0);
    let mouseX = 0;
    let mouseY = 0;
    let mouseActive = false;
    let frame = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / SPACING) + 2;
      rows = Math.ceil(height / SPACING) + 2;
      offsetX = new Float32Array(cols * rows);
      offsetY = new Float32Array(cols * rows);
      requestDraw();
    }

    function step(): boolean {
      let moving = false;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          let tx = 0;
          let ty = 0;
          if (mouseActive) {
            const dx = mouseX - i * SPACING;
            const dy = mouseY - j * SPACING;
            const dist = Math.hypot(dx, dy);
            if (dist < RADIUS) {
              const falloff = 1 - dist / RADIUS;
              const strength = falloff * falloff * PULL;
              tx = dx * strength;
              ty = dy * strength;
            }
          }
          const nx = offsetX[k] + (tx - offsetX[k]) * EASE;
          const ny = offsetY[k] + (ty - offsetY[k]) * EASE;
          if (Math.abs(nx - tx) > 0.05 || Math.abs(ny - ty) > 0.05) moving = true;
          offsetX[k] = nx;
          offsetY[k] = ny;
        }
      }
      return moving;
    }

    function strokeLines(major: boolean) {
      ctx!.beginPath();
      for (let j = 0; j < rows; j++) {
        if ((j % MAJOR_EVERY === 0) !== major) continue;
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const x = i * SPACING + offsetX[k] - 0.5;
          const y = j * SPACING + offsetY[k] - 0.5;
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
      }
      for (let i = 0; i < cols; i++) {
        if ((i % MAJOR_EVERY === 0) !== major) continue;
        for (let j = 0; j < rows; j++) {
          const k = j * cols + i;
          const x = i * SPACING + offsetX[k] - 0.5;
          const y = j * SPACING + offsetY[k] - 0.5;
          if (j === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
      }
      ctx!.strokeStyle = major ? MAJOR_COLOR : MINOR_COLOR;
      ctx!.lineWidth = 1;
      ctx!.stroke();
    }

    function draw() {
      frame = 0;
      const moving = reduceMotion ? false : step();
      ctx!.clearRect(0, 0, width, height);
      strokeLines(false);
      strokeLines(true);
      if (moving) requestDraw();
    }

    function requestDraw() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive =
        mouseX >= 0 && mouseY >= 0 && mouseX <= rect.width && mouseY <= rect.height;
      requestDraw();
    }

    function onLeave() {
      mouseActive = false;
      requestDraw();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
}
