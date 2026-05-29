"use client";

import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";
import { useRef, type ReactNode } from "react";

type Props = Omit<HTMLMotionProps<"a">, "ref" | "children"> & {
  children: ReactNode;
  strength?: number;
  href: string;
};

/**
 * Magnetic cursor-following CTA — the kind seen on motionsites.ai galleries.
 * Translates toward the pointer within `strength` px, spring-damped on leave.
 *
 * Motion uses the Sunday Estate house easing (Expo-out, defined in globals.css
 * as `--ease-brand`) for the rest hover/exit easing.
 */
export function MagneticButton({
  children,
  strength = 18,
  className = "",
  href,
  ...rest
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set((relX / rect.width) * strength * 2);
    y.set((relY / rect.height) * strength * 2);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={`inline-flex items-center gap-2 rounded-pill px-7 py-3 font-medium ${className}`}
      {...rest}
    >
      {children}
    </motion.a>
  );
}
