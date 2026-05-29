"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

/**
 * Lightweight SVG figures for the cinematic scroll journey.
 *
 * Design notes:
 *  - All figures are geometric / line-based to match the prototype icon style
 *    (stroke 1.4, 16×16 grid sensibility) — no photographic content
 *  - Each figure accepts a scrollYProgress MotionValue so it can be driven by
 *    the parent Journey container's scroll instead of computing its own
 *  - Colors are pinned to brand tokens (navy, gold, paper, ink)
 */

/* ─────────────────────────── Stars ─────────────────────────── */
type Star = { x: number; y: number; r: number; delay: number };
const STARS: Star[] = Array.from({ length: 56 }, (_, i) => {
  // Deterministic so SSR/CSR match
  const seed = (i * 9301 + 49297) % 233280;
  const x = (seed / 233280) * 100;
  const y = (((i * 7) % 73) / 73) * 100;
  const r = 0.4 + ((i % 5) / 5) * 1.2;
  const delay = (i % 11) * 0.27;
  return { x, y, r, delay };
});

export function Stars({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.svg
      style={{ opacity }}
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {STARS.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r * 0.12}
          fill="#fff2b7"
          animate={{ opacity: [0.3, 1, 0.4] }}
          transition={{
            duration: 2.8 + (i % 5) * 0.4,
            delay: s.delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.svg>
  );
}

/* ─────────────────────────── Moon / Sun ─────────────────────────── */
export function CelestialBody({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  // Moves diagonally across the viewport as the page scrolls
  const x = useTransform(progress, [0, 1], ["12%", "82%"]);
  const y = useTransform(progress, [0, 0.5, 1], ["18%", "10%", "55%"]);
  const scale = useTransform(progress, [0, 0.5, 1], [1, 1.15, 1.4]);
  const fill = useTransform(
    progress,
    [0, 0.35, 0.7, 1],
    ["#e8eef9", "#fdd789", "#f6a800", "#fff2b7"],
  );
  const glow = useTransform(
    progress,
    [0, 0.5, 1],
    ["0 0 40px rgba(232,238,249,0.4)", "0 0 80px rgba(246,168,0,0.4)", "0 0 140px rgba(255,242,183,0.6)"],
  );

  return (
    <motion.div
      style={{ left: x, top: y, scale, boxShadow: glow, background: fill }}
      className="pointer-events-none absolute h-16 w-16 rounded-full"
    />
  );
}

/* ─────────────────────────── Distant Horizon (Act 1→2) ─────────────────────────── */
export function Horizon({ y }: { y: MotionValue<string> }) {
  return (
    <motion.svg
      style={{ y }}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[28vh] w-full"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 200 L0 120 Q300 80 600 110 T1200 100 L1200 200 Z"
        fill="rgba(0,44,95,0.55)"
      />
      <path
        d="M0 200 L0 150 Q400 120 800 140 T1200 130 L1200 200 Z"
        fill="rgba(0,44,95,0.85)"
      />
    </motion.svg>
  );
}

/* ─────────────────────────── Road perspective (Act 2) ─────────────────────────── */
export function Road({ progress }: { progress: MotionValue<number> }) {
  const dashOffset = useTransform(progress, [0, 1], [0, -120]);
  const opacity = useTransform(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <motion.svg
      style={{ opacity }}
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="roadFade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="35%" stopColor="rgba(246,168,0,0.18)" />
          <stop offset="100%" stopColor="rgba(246,168,0,0.45)" />
        </linearGradient>
      </defs>
      {/* Road body */}
      <path
        d="M480 220 L520 220 L760 600 L240 600 Z"
        fill="url(#roadFade)"
      />
      {/* Dashed center line */}
      <motion.path
        d="M500 220 L500 600"
        stroke="#f6a800"
        strokeWidth="3"
        strokeDasharray="14 22"
        style={{ strokeDashoffset: dashOffset }}
        fill="none"
      />
    </motion.svg>
  );
}

/* ─────────────────────────── Land plots (Act 2) ─────────────────────────── */
export function LandPlots({ progress }: { progress: MotionValue<number> }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 400"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 80 + i * 170;
        return (
          <PlotRect
            key={i}
            x={x}
            delay={i * 0.08}
            progress={progress}
            index={i}
          />
        );
      })}
    </svg>
  );
}

function PlotRect({
  x,
  delay,
  progress,
  index,
}: {
  x: number;
  delay: number;
  progress: MotionValue<number>;
  index: number;
}) {
  const opacity = useTransform(
    progress,
    [0.2 + delay, 0.45 + delay, 0.85, 1],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [0.2 + delay, 0.6 + delay],
    [20, 0],
  );
  return (
    <motion.g style={{ opacity, y }}>
      <rect
        x={x}
        y={240 - index * 4}
        width="130"
        height="80"
        fill="none"
        stroke="rgba(246,168,0,0.55)"
        strokeWidth="1.4"
        strokeDasharray="4 3"
      />
      <text
        x={x + 65}
        y={290 - index * 4}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="11"
        fill="#f6a800"
        opacity="0.7"
      >
        Plot {String(index + 1).padStart(2, "0")}
      </text>
    </motion.g>
  );
}

/* ─────────────────────────── Buildings (Act 3) ─────────────────────────── */
type Building = { x: number; w: number; h: number };
const BUILDINGS: Building[] = [
  { x: 60, w: 80, h: 140 },
  { x: 160, w: 60, h: 200 },
  { x: 240, w: 100, h: 260 },
  { x: 360, w: 70, h: 180 },
  { x: 450, w: 110, h: 320 },
  { x: 580, w: 80, h: 220 },
  { x: 680, w: 90, h: 280 },
  { x: 790, w: 70, h: 200 },
  { x: 880, w: 60, h: 150 },
];

export function Skyline({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.15, 0.9, 1], [0, 1, 1, 0]);
  return (
    <motion.svg
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[60vh] w-full"
      viewBox="0 0 1000 420"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      {BUILDINGS.map((b, i) => (
        <BuildingRect key={i} {...b} delay={i * 0.05} progress={progress} />
      ))}
    </motion.svg>
  );
}

function BuildingRect({
  x,
  w,
  h,
  delay,
  progress,
}: Building & { delay: number; progress: MotionValue<number> }) {
  const offset = useTransform(
    progress,
    [0.05 + delay, 0.55 + delay],
    [h, 0],
  );
  return (
    <motion.g style={{ y: offset }}>
      <rect
        x={x}
        y={420 - h}
        width={w}
        height={h}
        fill="rgba(0,44,95,0.92)"
        stroke="rgba(246,168,0,0.18)"
        strokeWidth="1"
      />
      {/* Window grid */}
      {Array.from({ length: Math.floor(h / 22) }).map((_, row) =>
        Array.from({ length: Math.floor(w / 18) }).map((_, col) => {
          const lit = (row * 3 + col + Math.floor(x / 10)) % 4 === 0;
          return (
            <rect
              key={`${row}-${col}`}
              x={x + 8 + col * 18}
              y={420 - h + 14 + row * 22}
              width="6"
              height="10"
              fill={lit ? "#f6a800" : "rgba(255,255,255,0.08)"}
              opacity={lit ? 0.85 : 0.5}
            />
          );
        }),
      )}
    </motion.g>
  );
}

/* ─────────────────────────── Certificate stamp (Act 4) ─────────────────────────── */
export function CertificateStamp({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const scale = useTransform(progress, [0, 0.4, 1], [0.7, 1, 1.05]);
  const opacity = useTransform(progress, [0, 0.3, 0.9, 1], [0, 1, 1, 0]);
  const rotate = useTransform(progress, [0, 1], [-8, 0]);
  return (
    <motion.svg
      style={{ scale, opacity, rotate }}
      className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2"
      viewBox="0 0 200 200"
      aria-hidden
    >
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="rgba(246,168,0,0.35)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke="rgba(246,168,0,0.55)"
        strokeWidth="1.4"
      />
      <circle
        cx="100"
        cy="100"
        r="66"
        fill="none"
        stroke="rgba(246,168,0,0.4)"
        strokeWidth="0.8"
      />
      <text
        x="100"
        y="88"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="6"
        fill="#f6a800"
        letterSpacing="2"
      >
        REGISTERED · ภาครัฐ · e-GP
      </text>
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="11"
        fontWeight="600"
        fill="#fff2b7"
      >
        M2569012964
      </text>
      <text
        x="100"
        y="124"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="5"
        fill="rgba(255,242,183,0.7)"
        letterSpacing="1.5"
      >
        TAX 0105568042151
      </text>
      <text
        x="100"
        y="138"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="5"
        fill="rgba(255,242,183,0.55)"
        letterSpacing="1.5"
      >
        EST. 2568
      </text>
    </motion.svg>
  );
}

/* ─────────────────────────── House (Act 5) ─────────────────────────── */
export function House({ progress }: { progress: MotionValue<number> }) {
  const scale = useTransform(progress, [0, 0.4, 1], [0.85, 1, 1.04]);
  const y = useTransform(progress, [0, 1], ["6vh", "0vh"]);
  const litOpacity = useTransform(progress, [0.2, 0.7], [0, 1]);
  const haloScale = useTransform(progress, [0, 1], [0.6, 1.4]);
  const haloOpacity = useTransform(progress, [0, 0.5, 1], [0, 0.6, 0.85]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[14vh] flex justify-center">
      {/* Warm halo */}
      <motion.div
        style={{ scale: haloScale, opacity: haloOpacity }}
        className="absolute bottom-0 h-[80vmin] w-[80vmin] rounded-full"
        aria-hidden
        // Inline radial gradient — outside Tailwind v4's color tokens
        // intentionally because this is a one-off cinematic glow.
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(246,168,0,0.55) 0%, rgba(246,168,0,0.18) 35%, rgba(246,168,0,0) 70%)",
          }}
        />
      </motion.div>

      <motion.svg
        style={{ scale, y }}
        viewBox="0 0 240 200"
        className="relative h-[44vmin] w-[44vmin]"
        aria-hidden
      >
        {/* House body */}
        <path
          d="M40 90 L120 30 L200 90 L200 180 L40 180 Z"
          fill="#081832"
          stroke="#f6a800"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Roof line accent */}
        <path
          d="M40 90 L120 30 L200 90"
          fill="none"
          stroke="#fff2b7"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Door */}
        <motion.rect
          x="108"
          y="125"
          width="24"
          height="55"
          fill="#f6a800"
          style={{ opacity: litOpacity }}
        />
        <rect
          x="108"
          y="125"
          width="24"
          height="55"
          fill="none"
          stroke="#fff2b7"
          strokeWidth="1.4"
        />
        {/* Windows — top row */}
        {[
          { x: 60, y: 100 },
          { x: 160, y: 100 },
        ].map((w, i) => (
          <g key={`top-${i}`}>
            <motion.rect
              x={w.x}
              y={w.y}
              width="24"
              height="20"
              fill="#fff2b7"
              style={{ opacity: litOpacity }}
            />
            <rect
              x={w.x}
              y={w.y}
              width="24"
              height="20"
              fill="none"
              stroke="#f6a800"
              strokeWidth="1.4"
            />
            <line
              x1={w.x + 12}
              y1={w.y}
              x2={w.x + 12}
              y2={w.y + 20}
              stroke="#f6a800"
              strokeWidth="1"
            />
            <line
              x1={w.x}
              y1={w.y + 10}
              x2={w.x + 24}
              y2={w.y + 10}
              stroke="#f6a800"
              strokeWidth="1"
            />
          </g>
        ))}
        {/* Windows — side */}
        {[
          { x: 60, y: 140 },
          { x: 160, y: 140 },
        ].map((w, i) => (
          <g key={`side-${i}`}>
            <motion.rect
              x={w.x}
              y={w.y}
              width="20"
              height="20"
              fill="#fff2b7"
              style={{ opacity: litOpacity }}
            />
            <rect
              x={w.x}
              y={w.y}
              width="20"
              height="20"
              fill="none"
              stroke="#f6a800"
              strokeWidth="1.4"
            />
          </g>
        ))}
        {/* Chimney */}
        <rect x="150" y="42" width="14" height="22" fill="#081832" stroke="#f6a800" strokeWidth="1.4" />
      </motion.svg>
    </div>
  );
}
