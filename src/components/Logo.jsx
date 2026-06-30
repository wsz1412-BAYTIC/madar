/**
 * MadarLogo — centralized brand logo components.
 *
 * MadarFullLogo: the official full lockup (icon + wordmark + bilingual tagline).
 *   variant="light" → white logo, for dark backgrounds.
 *   variant="dark"  → inverted (dark) logo, for light backgrounds.
 *
 * MadarLogo (default): the colored icon-only symbol, kept for backward compat.
 */

const LOGO_WHITE_FULL =
  "https://media.base44.com/images/public/6a440c5bd1288d40c2b699ce/50737908a_IMG_7741.png";

const LOGO_COLOR_ICON =
  "https://media.base44.com/images/public/6a440c5bd1288d40c2b699ce/888d74ebd_MADARMainsymbol.png";

export function MadarFullLogo({
  variant = "light",
  className = "",
  style,
}) {
  const isLight = variant === "light";
  return (
    <img
      src={LOGO_WHITE_FULL}
      alt="Madar — AI Revenue Intelligence for Saudi Short-Term Rentals"
      className={`object-contain flex-shrink-0 ${className}`}
      style={{
        ...style,
        ...(isLight ? {} : { filter: "invert(1)" }),
      }}
      draggable={false}
    />
  );
}

export default function MadarLogo({ size = 36, className = "", style }) {
  return (
    <img
      src={LOGO_COLOR_ICON}
      alt="Madar"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      style={style}
      draggable={false}
    />
  );
}

export { LOGO_WHITE_FULL, LOGO_COLOR_ICON };