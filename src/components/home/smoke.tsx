"use client";

import { useEffect, useRef } from "react";

/**
 * Fumée légère animée en canvas 2D (pas de vidéo, pas de WebGL) :
 * ~36 volutes douces qui montent et se dissipent. S'arrête hors écran,
 * onglet masqué ou si l'utilisateur préfère moins d'animations.
 */
export function Smoke({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Volute pré-dessinée une fois (dégradé radial ivoire chaud)
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 256;
    const s = sprite.getContext("2d")!;
    const g = s.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(242,232,214,0.55)");
    g.addColorStop(0.45, "rgba(226,206,176,0.18)");
    g.addColorStop(1, "rgba(226,206,176,0)");
    s.fillStyle = g;
    s.fillRect(0, 0, 256, 256);

    let w = 0, h = 0, raf = 0, running = false, last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; life: number; age: number; rot: number; vr: number };
    let parts: P[] = [];
    const spawn = (initial: boolean): P => ({
      x: w * (0.1 + Math.random() * 0.8),
      y: initial ? h * (0.3 + Math.random() * 0.8) : h + 80,
      r: (w < 640 ? 120 : 200) * (0.6 + Math.random() * 0.9),
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.12 + Math.random() * 0.22),
      a: 0.08 + Math.random() * 0.12,
      life: 9000 + Math.random() * 9000,
      age: initial ? Math.random() * 9000 : 0,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.0004,
    });
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: w < 640 ? 22 : 36 }, () => spawn(true));
    };
    const draw = (t: number) => {
      const dt = Math.min(t - last || 16, 50);
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.age += dt;
        p.x += p.vx * dt * 0.06 + Math.sin((p.age + p.r) / 2400) * 0.15;
        p.y += p.vy * dt * 0.06;
        p.rot += p.vr * dt;
        const k = p.age / p.life;
        const alpha = p.a * Math.sin(Math.min(Math.max(k, 0), 1) * Math.PI);
        const size = p.r * (1 + k * 0.8);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size * 0.75);
        ctx.restore();
        if (p.age >= p.life || p.y < -size) Object.assign(p, spawn(false));
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    const start = () => { if (!running && !reduce) { running = true; last = performance.now(); raf = requestAnimationFrame(draw); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    draw(performance.now()); // une image fixe même sans animation
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()));
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);
    return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
