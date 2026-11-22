import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The official VECTIS logo.
 *
 * This is the ONLY component that references the logo file. The file in
 * public/brand/vectis-logo.jpg is the client's master asset, byte-for-byte as
 * supplied: it must never be redrawn, recoloured, cropped or stretched.
 *
 * The master is a 1200 x 896 JPEG on a solid white background. Until an
 * approved transparent version is supplied, the logo is always shown on a
 * white panel so the white background reads as intentional rather than as a
 * box sitting on Mineral Ivory or Midnight Indigo.
 *
 * Size it by width only; the height follows automatically, so the proportions
 * can never be distorted.
 */

const LOGO_SRC = "/brand/vectis-logo.jpg";
const LOGO_WIDTH = 1200;
const LOGO_HEIGHT = 896;

type LogoProps = {
  /** Rendered width in CSS pixels. Height is derived from the original ratio. */
  width: number;
  /** Load immediately (use for logos visible without scrolling). */
  priority?: boolean;
  className?: string;
};

export function Logo({ width, priority = false, className }: LogoProps) {
  const height = Math.round((width * LOGO_HEIGHT) / LOGO_WIDTH);

  return (
    <span className={cn("inline-block bg-white leading-none", className)}>
      <Image
        src={LOGO_SRC}
        alt="VECTIS — Est. 1956"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        sizes={`${width}px`}
        style={{ width, height }}
        className="block"
      />
    </span>
  );
}
