import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The official VECTIS logo.
 *
 * This is the ONLY component that references the logo files. The artwork is
 * the client's master asset and must never be redrawn, recoloured, stretched
 * or rearranged.
 *
 * - public/brand/vectis-logo.jpg is the master as supplied, byte for byte.
 * - public/brand/vectis-logo.png is the same artwork with its white
 *   background made transparent, so the logo can sit directly on Mineral
 *   Ivory or white with no panel behind it. The artwork is untouched: it is
 *   drawn in Midnight Indigo (#0D115A), the brand's own colour.
 * - public/brand/vectis-emblem.png is the diamond-and-globe mark on its own,
 *   as the brand guide shows for the browser tab icon and small square uses.
 *
 * Size it by width only; the height follows automatically, so the
 * proportions can never be distorted.
 */

const FULL = { src: "/brand/vectis-logo.png", width: 855, height: 541 };
const EMBLEM = { src: "/brand/vectis-emblem.png", width: 370, height: 370 };

type LogoProps = {
  /** Rendered width in CSS pixels. Height is derived from the original ratio. */
  width: number;
  /** The diamond-and-globe mark on its own, without the name. */
  emblem?: boolean;
  /** Load immediately (use for logos visible without scrolling). */
  priority?: boolean;
  className?: string;
};

export function Logo({ width, emblem = false, priority = false, className }: LogoProps) {
  const art = emblem ? EMBLEM : FULL;
  const height = Math.round((width * art.height) / art.width);
  return (
    <Image
      src={art.src}
      alt={emblem ? "VECTIS" : "VECTIS — Est. 1956"}
      width={art.width}
      height={art.height}
      priority={priority}
      sizes={`${width}px`}
      style={{ width, height }}
      className={cn("block", className)}
    />
  );
}
