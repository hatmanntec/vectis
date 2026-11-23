import type { Item } from "./page-blocks";

/**
 * The governance accountability loop (CMS > Website Pages > Governance >
 * Accountability loop), drawn as stages around a circle joined by arrows
 * that return to the start. On phones it becomes a numbered list ending
 * with a return to the first stage. The list is also the version read by
 * screen readers on every screen size; the drawing is decorative.
 */
export function GovernanceLoop({ stages }: { stages: Item[] }) {
  if (stages.length < 2) return null;
  const n = stages.length;
  const angle = (i: number) => -90 + (360 / n) * i;
  const rad = (d: number) => (d * Math.PI) / 180;
  const R = 38;
  const point = (deg: number) => ({ x: 50 + R * Math.cos(rad(deg)), y: 50 + R * Math.sin(rad(deg)) });
  // Each arrow runs from just after one stage to just before the next.
  const gap = Math.min(22, 120 / n);
  const arcs = stages.map((_, i) => {
    const a = point(angle(i) + gap);
    const b = point(angle(i + 1) - gap);
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  });

  return (
    <div className="reveal">
      {/* Drawing: tablets and larger */}
      <div aria-hidden className="relative mx-auto hidden aspect-square w-full max-w-[40rem] md:block">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <marker id="loop-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vectis-copper)" />
            </marker>
          </defs>
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--vectis-steel)" strokeWidth="0.25" strokeDasharray="0.8 1.2" />
          {arcs.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--vectis-copper)" strokeWidth="0.45" markerEnd="url(#loop-arrow)" />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="t-label max-w-[9rem] text-center text-[var(--ink-muted)]">Accountability loop</p>
        </div>
        {stages.map((s, i) => {
          const p = point(angle(i));
          return (
            <div
              key={`${s.heading}-${i}`}
              className="absolute w-[13rem] -translate-x-1/2 -translate-y-1/2 border border-indigo bg-white px-4 py-3 text-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <p className="t-label t-index">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 font-serif text-lg leading-snug text-indigo">{s.heading}</p>
              {s.text ? <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">{s.text}</p> : null}
            </div>
          );
        })}
      </div>

      {/* List: phones, and screen readers everywhere */}
      <ol className="border-l border-copper pl-6 md:sr-only">
        {stages.map((s, i) => (
          <li key={`${s.heading}-${i}`} className="relative pb-6">
            <span aria-hidden className="absolute top-1.5 -left-[30px] size-[11px] border border-copper bg-ivory" />
            <p className="t-label t-index">{String(i + 1).padStart(2, "0")}</p>
            <p className="mt-1 font-serif text-xl text-indigo">{s.heading}</p>
            {s.text ? <p className="mt-1 text-[0.9375rem] text-[var(--ink-muted)]">{s.text}</p> : null}
          </li>
        ))}
        <li className="t-label text-[var(--ink-muted)]">{`Then back to ${stages[0].heading}`}</li>
      </ol>
    </div>
  );
}
