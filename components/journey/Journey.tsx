"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import {
  CelestialBody,
  CertificateStamp,
  Horizon,
  House,
  LandPlots,
  Road,
  Skyline,
  Stars,
} from "@/components/journey/figures";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { COMPANY } from "@/lib/company";

/**
 * Cinematic scroll narrative for the Sunday Estate landing page.
 *
 * Storyboard — 5 acts that read like a short film travelling home:
 *   1. Outset   — night sky, stars, distant logo, tagline "การเดินทางกลับบ้าน"
 *   2. Land     — dawn breaking over a road and parcel plots
 *   3. Build    — a skyline rises as the sky warms
 *   4. Trust    — an e-GP / registration stamp materialises
 *   5. Home     — a lit house glows with warm gold; CTA + contact
 *
 * Implementation notes:
 *   - One shared scroll progress drives the whole page (sky color, celestial
 *     body, atmospheric figures). Each act consumes the slice it cares about.
 *   - The sky is a sticky full-viewport canvas behind every act so the
 *     "movie reel" feel is unbroken; acts scroll over it as foreground frames.
 *   - Brand house easing (Expo-out, --ease-brand) used everywhere.
 *   - All artwork is SVG geometry. No photos yet (per user — placeholders OK,
 *     but stronger to lean into the illustrated aesthetic until real shots
 *     arrive).
 */

const ease = [0.22, 1, 0.36, 1] as const;

export function Journey() {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll over the whole journey, normalised 0–1.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Sky color travels: deep night → indigo → dawn navy → warm amber → cream.
  const sky = useTransform(
    scrollYProgress,
    [0, 0.18, 0.4, 0.62, 0.82, 1],
    ["#040a18", "#061429", "#0a3d7d", "#5a3e1a", "#c98b2a", "#fdf2dc"],
  );

  // Brand text contrast inverts across the journey.
  const ink = useTransform(
    scrollYProgress,
    [0, 0.7, 0.88, 1],
    ["#f7fbff", "#fff2b7", "#5a3e1a", "#002c5f"],
  );

  // Stars fade out as dawn breaks.
  const starsOpacity = useTransform(scrollYProgress, [0, 0.25, 0.4], [1, 0.6, 0]);

  // Local progress slices per act.
  const act2Progress = useTransform(scrollYProgress, [0.15, 0.38], [0, 1]);
  const act3Progress = useTransform(scrollYProgress, [0.38, 0.6], [0, 1]);
  const act4Progress = useTransform(scrollYProgress, [0.6, 0.78], [0, 1]);
  const act5Progress = useTransform(scrollYProgress, [0.78, 1], [0, 1]);

  // Horizon parallax — drifts up slowly.
  const horizonY = useTransform(scrollYProgress, [0, 0.4], ["0%", "-30%"]);

  return (
    <motion.div
      ref={ref}
      style={{ backgroundColor: sky, color: ink }}
      className="relative w-full"
    >
      {/* Persistent sky layer — fixed behind every act (no flow space taken,
          so Act 1 begins at the top of the viewport instead of being pushed
          down by an h-screen sticky element). */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <Stars opacity={starsOpacity} />
        <CelestialBody progress={scrollYProgress} />
        <Horizon y={horizonY} />
      </div>

      {/* Nav rides on top of every act */}
      <TopNav />

      {/* Acts — each one is a 100svh frame */}
      <Act1Outset />
      <Act2Land progress={act2Progress} />
      <Act3Build progress={act3Progress} />
      <Act4Trust progress={act4Progress} />
      <Act5Home progress={act5Progress} />

      <Footer />
    </motion.div>
  );
}

/* ────────────────────────────── Top nav ────────────────────────────── */
function TopNav() {
  return (
    <header className="pointer-events-auto fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12">
      <div className="flex items-center gap-3">
        <Image
          src="/logo/sunday-logo-mark.png"
          alt="Sunday Estate"
          width={32}
          height={32}
          className="h-8 w-8"
          priority
        />
        <div className="flex flex-col leading-none">
          <span className="font-display text-[12px] font-medium tracking-[0.22em] text-gold">
            SUNDAY ESTATE
          </span>
          <span className="text-[10px] text-current/55">บริษัท ซันเดย์ เอสเตท จำกัด</span>
        </div>
      </div>
      <a
        href={COMPANY.appUrl}
        className="rounded-pill border border-current/20 px-4 py-1.5 text-[11px] tracking-wider backdrop-blur-sm transition hover:border-gold hover:text-gold"
      >
        เข้าสู่ระบบ →
      </a>
    </header>
  );
}

/* ────────────────────────────── ACT 1 — Outset ────────────────────────────── */
function Act1Outset() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center md:px-12">
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.2 }}
        className="font-display text-[11px] font-bold uppercase tracking-[0.32em] text-gold/80"
      >
        Est. 2568 · ที่ดิน · จัดสรร · ภาครัฐ
      </motion.span>

      <h1 className="relative mt-6 max-w-3xl overflow-hidden font-display text-[clamp(36px,7vw,80px)] font-medium leading-[1.05] tracking-tight">
        {["การเดินทาง", "กลับบ้านที่อบอุ่น"].map((line, i) => (
          <span key={line} className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.0, ease, delay: 0.35 + i * 0.15 }}
              className="block"
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.95 }}
        className="mt-6 max-w-xl text-[15px] text-current/75 md:text-[17px]"
      >
        ทุกที่ดินมีเรื่องราว ทุกสัญญามีปลายทาง
        <br />
        เราพาคุณเดินทางจนถึงบ้าน
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1.2 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-current/45"
      >
        <span>เลื่อนลงเพื่อออกเดินทาง</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-6 w-px bg-current/45"
        />
      </motion.div>
    </section>
  );
}

/* ────────────────────────────── ACT 2 — Land ────────────────────────────── */
function Act2Land({ progress }: { progress: MotionValue<number> }) {
  const titleOpacity = useTransform(progress, [0, 0.3, 0.85, 1], [0, 1, 1, 0]);
  return (
    <section className="relative flex min-h-[140vh] flex-col items-center justify-start px-6 pt-[14vh] md:px-12">
      <Road progress={progress} />
      <LandPlots progress={progress} />

      <motion.div
        style={{ opacity: titleOpacity }}
        className="sticky top-1/3 z-10 mx-auto max-w-2xl text-center"
      >
        <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em] text-gold">
          Chapter I · ที่ดิน
        </p>
        <h2 className="mt-3 font-display text-[clamp(28px,5vw,52px)] font-medium leading-tight">
          ทุกบ้านเริ่มต้น
          <br />
          จากที่ดินผืนหนึ่ง
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[14px] text-current/70 md:text-[15px]">
          ซื้อ ขาย จัดสรร และพัฒนาที่ดิน
          — สำหรับโครงการที่อยู่อาศัย พาณิชยกรรม และอุตสาหกรรม.
        </p>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────── ACT 3 — Build ────────────────────────────── */
function Act3Build({ progress }: { progress: MotionValue<number> }) {
  const titleOpacity = useTransform(progress, [0, 0.25, 0.9, 1], [0, 1, 1, 0]);
  return (
    <section className="relative flex min-h-[140vh] flex-col items-center justify-start px-6 pt-[14vh] md:px-12">
      <Skyline progress={progress} />

      <motion.div
        style={{ opacity: titleOpacity }}
        className="sticky top-1/4 z-10 mx-auto max-w-2xl text-center"
      >
        <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em] text-gold">
          Chapter II · ทรัพย์สิน
        </p>
        <h2 className="mt-3 font-display text-[clamp(28px,5vw,52px)] font-medium leading-tight">
          เมื่อความฝัน
          <br />
          กลายเป็นโครงการ
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[14px] text-current/70 md:text-[15px]">
          บริหารสัญญา ขายฝาก จำนอง โฉนด และพอร์ตทรัพย์สิน
          — ครบจบในระบบเดียวที่คุณวางใจ.
        </p>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────── ACT 4 — Trust ────────────────────────────── */
function Act4Trust({ progress }: { progress: MotionValue<number> }) {
  const titleOpacity = useTransform(progress, [0, 0.3, 0.9, 1], [0, 1, 1, 0]);
  const statY = useTransform(progress, [0, 1], [40, 0]);
  return (
    <section className="relative flex min-h-[140vh] flex-col items-center justify-start px-6 pt-[14vh] md:px-12">
      <CertificateStamp progress={progress} />

      <motion.div
        style={{ opacity: titleOpacity }}
        className="sticky top-[18vh] z-10 mx-auto max-w-3xl text-center"
      >
        <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em] text-gold">
          Chapter III · ความน่าเชื่อถือ
        </p>
        <h2 className="mt-3 font-display text-[clamp(26px,4.5vw,46px)] font-medium leading-tight">
          จดทะเบียนกับภาครัฐ
          <br />
          พร้อมเข้าร่วม e-GP
        </h2>

        <motion.div
          style={{ y: statY }}
          className="mx-auto mt-12 grid w-fit max-w-2xl grid-cols-1 gap-4 rounded-hero border border-gold/25 bg-ink/30 p-6 backdrop-blur-md md:grid-cols-3 md:gap-8 md:p-7"
        >
          <Stat label="e-GP Registered" value={COMPANY.egp} />
          <Stat label="Business Objectives" value="32" />
          <Stat label="Categories" value="7" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[150px] text-center">
      <div className="font-mono text-2xl font-medium tabular-nums text-gold">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-current/65">
        {label}
      </div>
    </div>
  );
}

/* ────────────────────────────── ACT 5 — Home ────────────────────────────── */
function Act5Home({ progress }: { progress: MotionValue<number> }) {
  const titleOpacity = useTransform(progress, [0, 0.25, 1], [0, 1, 1]);
  return (
    <section
      id="contact"
      className="relative flex min-h-[120vh] flex-col items-center justify-end px-6 pb-[18vh] pt-[14vh] md:px-12"
    >
      <House progress={progress} />

      <motion.div
        style={{ opacity: titleOpacity }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--se-gold-text)]">
          Welcome home · ยินดีต้อนรับ
        </p>
        <h2 className="mt-3 font-display text-[clamp(32px,6vw,64px)] font-medium leading-tight text-navy">
          บ้านที่อบอุ่น
          <br />
          เริ่มต้นที่นี่
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-[15px] text-navy/75 md:text-[17px]">
          คุยกับเราเรื่องที่ดิน โครงการ หรือความร่วมมือกับภาครัฐ —
          {" "}
          ยินดีรับฟังทุกเรื่องราว.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            href={`mailto:${COMPANY.email}`}
            className="bg-navy text-paper shadow-[0_18px_44px_rgba(0,44,95,0.18)] hover:bg-navy-2"
          >
            อีเมลถึงเรา <span aria-hidden>→</span>
          </MagneticButton>
          <a
            href={`tel:${COMPANY.phone.replace(/-/g, "")}`}
            className="rounded-pill border border-navy/25 px-7 py-3 font-medium text-navy transition hover:border-navy hover:bg-navy hover:text-paper"
          >
            โทร {COMPANY.phone}
          </a>
        </div>

        <div className="mx-auto mt-12 max-w-md text-[12px] leading-relaxed text-navy/65">
          {COMPANY.address.th}
        </div>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────── Footer ────────────────────────────── */
function Footer() {
  return (
    <footer className="relative z-10 border-t border-navy/15 bg-cream/80 px-6 py-8 text-navy backdrop-blur-sm md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[12px] text-navy/70 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="font-display font-medium text-navy">
            {COMPANY.nameTh}
          </span>
          <span className="mx-2 text-navy/30">·</span>
          {COMPANY.nameEn}
        </div>
        <div className="font-mono text-[11px] tabular-nums">
          Tax {COMPANY.taxId} · e-GP {COMPANY.egp}
        </div>
      </div>
    </footer>
  );
}
