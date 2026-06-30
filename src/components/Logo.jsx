/**
 * MadarLogo — the brand icon used across the app.
 * Uses the colored main symbol on a transparent background.
 * Adapts to light/dark contexts via the `variant` prop.
 */
const LOGO_URL = "https://media.base44.com/images/public/6a440c5bd1288d40c2b699ce/888d74ebd_MADARMainsymbol.png";

export default function MadarLogo({ size = 36, className = "", style }) {
  return (
    <img
      src={LOGO_URL}
      alt="Madar"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      style={style}
      draggable={false}
    />
  );
}