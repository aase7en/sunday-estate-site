import { type ReactNode } from "react";

/**
 * Bilingual label primitive — Thai on top (larger), English below (smaller, muted).
 * Ports the `<Bi>` pattern from sunday-estate-webapp/prototype/src/ui.jsx so brand
 * voice stays consistent across the marketing site and the internal app.
 *
 * In M2 this becomes locale-aware via next-intl; for M1 it always renders both.
 */
export function Bi({
  th,
  en,
  as: As = "span",
  className = "",
  thClassName = "",
  enClassName = "",
}: {
  th: ReactNode;
  en: ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  thClassName?: string;
  enClassName?: string;
}) {
  return (
    <As className={`flex flex-col gap-0.5 ${className}`}>
      <span className={`font-sans ${thClassName}`}>{th}</span>
      <span
        className={`font-display text-[0.78em] tracking-wide text-muted ${enClassName}`}
      >
        {en}
      </span>
    </As>
  );
}
