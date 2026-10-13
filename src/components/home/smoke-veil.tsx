"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Bruit fractal « replié sur lui-même » (domain warping) : volutes organiques
// qui montent et se défont lentement, sans particules.
const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform float dens;uniform vec3 fo;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2;
  float s=t*.045;
  vec2 q=vec2(fbm(p+vec2(0.,-s)),fbm(p+vec2(5.2,1.3-s)));
  vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)-vec2(0.,s*1.6)),fbm(p+3.*q+vec2(8.3,2.8)-vec2(0.,s*1.3)));
  float f=fbm(p+3.4*w);
  float c=smoothstep(.42,.95,f);
  vec2 d=(uv-fo.xy)*vec2(r.x/r.y,1.);
  float focus=smoothstep(fo.z,0.,length(d));
  float mask=(.12+.88*focus)*smoothstep(0.,.3,uv.y+.15);
  float a=c*mask*dens;
  gl_FragColor=vec4(vec3(.96,.92,.86)*a,a);
}`;

/**
 * Voile de fumée en WebGL, rendu à demi-résolution et ~30 i/s.
 * En pause hors écran ou onglet masqué ; une seule image fixe si l'utilisateur
 * préfère réduire les animations ; rien du tout si WebGL est indisponible.
 */
export function SmokeVeil({ className, density = 0.55 }: { className?: string; density?: number }) {
  // La fumée se concentre autour de l'arche : à droite sur ordinateur, en haut sur mobile.
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!canvas || !gl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Rendu logiciel (pas de GPU) : la fumée coûterait trop cher au processeur, on s'abstient.
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return;

    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r"), uT = gl.getUniformLocation(prog, "t"), uD = gl.getUniformLocation(prog, "dens"), uF = gl.getUniformLocation(prog, "fo");
    gl.uniform1f(uD, density);

    const scale = window.innerWidth < 768 ? 0.35 : 0.5;
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, canvas.width, canvas.height);
      const wide = canvas.clientWidth >= 1024;
      gl.uniform3f(uF, wide ? 0.74 : 0.5, wide ? 0.42 : 0.62, wide ? 0.85 : 0.7);
    };
    const t0 = performance.now() - 20000;
    const frame = (now: number) => { gl.uniform1f(uT, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); };

    let raf = 0, last = 0, visible = true;
    const loop = (now: number) => {
      if (now - last > 33) { frame(now); last = now; }
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    // Démarre une fois la page chargée et le navigateur au repos : ne retarde ni l'affichage ni les clics.
    const ro = new ResizeObserver(() => { resize(); frame(performance.now()); });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); });
    const onVis = () => (document.hidden ? stop() : start());
    let idle: number | ReturnType<typeof setTimeout> = 0;
    const boot = () => {
      resize();
      frame(performance.now());
      canvas.style.opacity = "1";
      ro.observe(canvas);
      io.observe(canvas);
      document.addEventListener("visibilitychange", onVis);
      start();
    };
    const schedule = () => {
      idle = "requestIdleCallback" in window ? window.requestIdleCallback(boot, { timeout: 2500 }) : globalThis.setTimeout(boot, 1200);
    };
    if (document.readyState === "complete") schedule(); else window.addEventListener("load", schedule, { once: true });
    return () => {
      stop(); ro.disconnect(); io.disconnect();
      window.removeEventListener("load", schedule);
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idle as number); else globalThis.clearTimeout(idle);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className={className} style={{ opacity: 0, transition: "opacity 2.5s ease" }} />;
}
