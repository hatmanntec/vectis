"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export type MapLink = { slug: string; investor: string; investee: string; nature: string };

const W = 1000;
const NODE_W = 300;
const NODE_H = 56;
const ROW = 92;
const PAD = 24;
/** Shrinks long company names so they stay inside their box. */
const nameFont = (name: string) => `400 ${Math.min(20, Math.floor(520 / Math.max(name.length, 1)))}px var(--vectis-serif)`;

/**
 * Who invests in whom, drawn from the published investments in the CMS.
 *
 * VECTIS businesses sit on the left (solid boxes) and the companies they
 * invest in on the right (dashed boxes), so the drawing never suggests that
 * a company invested in belongs to VECTIS. Each line carries the nature of
 * the investment in VECTIS's own words.
 *
 * The list underneath is the same information as text: it is what screen
 * readers and keyboards use, and pointing at or focusing an entry
 * highlights its line. Phones show the list only.
 */
export function RelationshipMap({ links, tone = "dark" }: { links: MapLink[]; tone?: "dark" | "light" }) {
  const [active, setActive] = useState<string | null>(null);
  if (!links.length) return null;
  const dark = tone === "dark";

  const investors = [...new Set(links.map((l) => l.investor))];
  const investees = [...new Set(links.map((l) => l.investee))];
  const rows = Math.max(investors.length, investees.length);
  const H = rows * ROW + PAD * 2 - (ROW - NODE_H);
  // Centre the shorter column against the taller one.
  const y = (i: number, n: number) => PAD + ((rows - n) * ROW) / 2 + i * ROW;
  const yi = (name: string) => y(investors.indexOf(name), investors.length) + NODE_H / 2;
  const ye = (name: string) => y(investees.indexOf(name), investees.length) + NODE_H / 2;

  const ink = dark ? "#ffffff" : "var(--vectis-indigo)";
  const quiet = dark ? "rgba(242,239,229,0.35)" : "var(--vectis-steel)";
  const panel = dark ? "var(--vectis-indigo)" : "#ffffff";
  const isOn = (l: MapLink) => active === null || active === l.slug;
  const touches = (name: string) => active === null || links.some((l) => l.slug === active && (l.investor === name || l.investee === name));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="hidden w-full md:block" aria-hidden>
        {links.map((l) => {
          const y1 = yi(l.investor);
          const y2 = ye(l.investee);
          const x1 = NODE_W;
          const x2 = W - NODE_W;
          const mx = (x1 + x2) / 2;
          const on = isOn(l);
          return (
            <g key={l.slug} style={{ transition: "opacity 200ms" }} opacity={on ? 1 : 0.25}>
              <path
                d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                fill="none"
                stroke={active === l.slug ? "var(--vectis-copper)" : quiet}
                strokeWidth={active === l.slug ? 2.5 : 1.5}
              />
              <circle cx={x2} cy={y2} r={4} fill={active === l.slug ? "var(--vectis-copper)" : quiet} />
            </g>
          );
        })}
        {links.map((l) => {
          const yMid = (yi(l.investor) + ye(l.investee)) / 2;
          const label = l.nature.toUpperCase();
          const w = label.length * 9.2 + 24;
          return (
            <g key={`label-${l.slug}`} opacity={isOn(l) ? 1 : 0.25} style={{ transition: "opacity 200ms" }}>
              <rect x={W / 2 - w / 2} y={yMid - 14} width={w} height={28} fill={panel} stroke={quiet} />
              <text x={W / 2} y={yMid + 5} textAnchor="middle" fill={ink} style={{ font: "500 14px var(--font-mono)", letterSpacing: "0.1em" }}>
                {label}
              </text>
            </g>
          );
        })}
        {investors.map((name, i) => (
          <g key={`i-${name}`} opacity={touches(name) ? 1 : 0.35} style={{ transition: "opacity 200ms" }}>
            <rect x={1} y={y(i, investors.length)} width={NODE_W - 2} height={NODE_H} fill={panel} stroke={ink} strokeWidth={1.25} />
            <text x={20} y={y(i, investors.length) + NODE_H / 2 + 7} fill={ink} style={{ font: nameFont(name) }}>
              {name}
            </text>
          </g>
        ))}
        {investees.map((name, i) => (
          <g key={`e-${name}`} opacity={touches(name) ? 1 : 0.35} style={{ transition: "opacity 200ms" }}>
            <rect
              x={W - NODE_W + 1}
              y={y(i, investees.length)}
              width={NODE_W - 2}
              height={NODE_H}
              fill={panel}
              stroke={ink}
              strokeWidth={1.25}
              strokeDasharray="5 4"
            />
            <text x={W - NODE_W + 20} y={y(i, investees.length) + NODE_H / 2 + 7} fill={ink} style={{ font: nameFont(name) }}>
              {name}
            </text>
          </g>
        ))}
      </svg>

      <div className={`mt-6 hidden items-center gap-6 md:flex t-label ${dark ? "text-ivory/80" : "text-[var(--ink-muted)]"}`} aria-hidden>
        <span className="flex items-center gap-2">
          <span className={`inline-block h-3 w-5 border ${dark ? "border-white" : "border-indigo"}`} /> VECTIS business
        </span>
        <span className="flex items-center gap-2">
          <span className={`inline-block h-3 w-5 border border-dashed ${dark ? "border-white" : "border-indigo"}`} /> Company invested in
        </span>
      </div>

      <ul className={`mt-8 border-t ${dark ? "border-ivory/30" : "border-steel"}`} aria-label="Investment relationships">
        {links.map((l) => (
          <li key={l.slug} className={`border-b ${dark ? "border-ivory/30" : "border-steel"}`}>
            <Link
              href={`/investments/${l.slug}`}
              onPointerEnter={() => setActive(l.slug)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(l.slug)}
              onBlur={() => setActive(null)}
              className={`group grid min-h-14 gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 ${dark ? "text-white" : "text-indigo"}`}
            >
              <span className="text-[0.9375rem]">
                <span className="font-medium">{l.investor}</span>
                <span className={dark ? "text-ivory/80" : "text-[var(--ink-muted)]"}> invests in </span>
                <span className="font-medium">{l.investee}</span>
              </span>
              <span className={`t-label flex items-center gap-3 ${dark ? "text-ivory/80" : "text-[var(--ink-muted)]"}`}>
                {l.nature}
                <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
