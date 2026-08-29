import React, { useState, useMemo } from "react";
import { User } from "lucide-react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

export interface LuxeAvatarProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  shape?: "circle" | "squircle";
  showRing?: boolean;
  ringProgress?: number; // 0 to 100
  ringStatus?: "online" | "away" | "offline" | "gold";
  onClick?: () => void;
  title?: string;
}

// Deterministic Luxury Color Palette (Matching Al-Foras Theme)
const DETERMINISTIC_PALETTES = [
  { bg: "bg-gradient-to-br from-[#123816] via-[#1B5E20] to-[#2E7D32]", text: "text-emerald-200", border: "border-emerald-500/50" }, // Deep Emerald
  { bg: "bg-gradient-to-br from-[#3D2C04] via-[#5C4308] to-[#8C650C]", text: "text-amber-200", border: "border-amber-500/50" }, // Royal Gold
  { bg: "bg-gradient-to-br from-[#0B253A] via-[#103E60] to-[#175888]", text: "text-sky-200", border: "border-sky-500/50" }, // Sapphire
  { bg: "bg-gradient-to-br from-[#2D123D] via-[#481E61] to-[#6A2D8E]", text: "text-purple-200", border: "border-purple-500/50" }, // Amethyst
  { bg: "bg-gradient-to-br from-[#3B1515] via-[#5E2222] to-[#853131]", text: "text-rose-200", border: "border-rose-500/50" }, // Garnet
  { bg: "bg-gradient-to-br from-[#132E27] via-[#1E4A3E] to-[#2D6E5D]", text: "text-teal-200", border: "border-teal-500/50" }, // Deep Jade
  { bg: "bg-gradient-to-br from-[#1E2530] via-[#2A3443] to-[#3D4B60]", text: "text-slate-200", border: "border-slate-400/50" }, // Platinum Slate
];

// Hash function for deterministic color from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate 2 initials by default (1 only when tiny), supporting Arabic & Latin scripts
export function getInitials(name?: string | null, singleLetterOnly: boolean = false): string {
  if (!name || !name.trim()) return "";
  const clean = name.trim().replace(/\s+/g, " ");
  const parts = clean.split(" ").filter(Boolean);

  if (parts.length === 0) return "";
  if (singleLetterOnly || parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  const first = parts[0].slice(0, 1);
  const last = parts[parts.length - 1].slice(0, 1);
  return `${first}${last}`.toUpperCase();
}

const SIZE_CONFIG: Record<AvatarSize, { px: number; text: string; icon: number; ringStroke: number; radius: string; cornerRx: number }> = {
  xs: { px: 22, text: "text-[10px]", icon: 11, ringStroke: 2, radius: "rounded-lg", cornerRx: 8 },
  sm: { px: 32, text: "text-xs font-bold", icon: 15, ringStroke: 2.2, radius: "rounded-xl", cornerRx: 12 },
  md: { px: 40, text: "text-sm font-bold", icon: 18, ringStroke: 2.5, radius: "rounded-2xl", cornerRx: 16 },
  lg: { px: 52, text: "text-base font-bold", icon: 24, ringStroke: 3, radius: "rounded-[18px]", cornerRx: 18 },
  xl: { px: 80, text: "text-2xl font-bold", icon: 34, ringStroke: 4, radius: "rounded-[24px]", cornerRx: 24 },
  hero: { px: 130, text: "text-4xl font-bold", icon: 54, ringStroke: 4.5, radius: "rounded-[28px]", cornerRx: 30 },
};

export const LuxeAvatar: React.FC<LuxeAvatarProps> = ({
  src,
  name,
  alt = "avatar",
  size = "md",
  className = "",
  shape = "squircle",
  showRing = false,
  ringProgress,
  ringStatus,
  onClick,
  title,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const isTiny = size === "xs";

  const palette = useMemo(() => {
    if (!name) return DETERMINISTIC_PALETTES[1]; // Default royal gold
    const index = hashString(name) % DETERMINISTIC_PALETTES.length;
    return DETERMINISTIC_PALETTES[index];
  }, [name]);

  const initials = useMemo(() => getInitials(name, isTiny), [name, isTiny]);

  const hasImage = Boolean(src && !imgFailed);
  const hasInitials = Boolean(!hasImage && initials);

  // Exact geometric padding for the progress frame
  const outerPad = showRing ? (size === "hero" ? 8 : size === "xl" ? 6 : 4) : 0;
  const totalSize = cfg.px + outerPad * 2;
  const strokeW = cfg.ringStroke;

  // Squircle parameters
  const isSquircle = shape === "squircle";
  const rectX = strokeW / 2;
  const rectY = strokeW / 2;
  const rectW = totalSize - strokeW;
  const rectH = totalSize - strokeW;
  const cornerR = cfg.cornerRx + (outerPad > 0 ? 2 : 0);

  // Approximate squircle perimeter: 4 * (straight side) + 2 * PI * r
  // straight side = W - 2*r
  const straightLength = Math.max(0, rectW - 2 * cornerR);
  const perimeter = 4 * straightLength + 2 * Math.PI * cornerR;

  // Circle parameters (if circle shape chosen)
  const circleRadius = (totalSize - strokeW) / 2;
  const circleCircumference = 2 * Math.PI * circleRadius;

  const totalPerimeter = isSquircle ? perimeter : circleCircumference;
  const progressVal = Math.min(Math.max(ringProgress ?? 100, 0), 100);
  const strokeDashoffset = totalPerimeter - (progressVal / 100) * totalPerimeter;

  const ringColorClass = useMemo(() => {
    if (ringStatus === "online") return "stroke-emerald-400";
    if (ringStatus === "away") return "stroke-amber-400";
    if (ringStatus === "offline") return "stroke-slate-500";
    return "stroke-primary"; // default gold
  }, [ringStatus]);

  const shapeClass = shape === "circle" ? "rounded-full" : cfg.radius;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${onClick ? "cursor-pointer group" : ""} ${className}`}
      style={{ width: totalSize, height: totalSize }}
      onClick={onClick}
      title={title || name || alt}
    >
      {/* Integrated Progress Frame (Matching Squircle/Rounded-Rect Shape perfectly) */}
      {showRing && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_hsl(var(--primary)/0.35)]"
          viewBox={`0 0 ${totalSize} ${totalSize}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {isSquircle ? (
            <>
              {/* Background Track Frame */}
              <rect
                x={rectX}
                y={rectY}
                width={rectW}
                height={rectH}
                rx={cornerR}
                ry={cornerR}
                fill="none"
                stroke="hsl(var(--border) / 0.45)"
                strokeWidth={strokeW}
              />
              {/* Active Animated Progress Frame */}
              <rect
                x={rectX}
                y={rectY}
                width={rectW}
                height={rectH}
                rx={cornerR}
                ry={cornerR}
                fill="none"
                className={`${ringColorClass} transition-all duration-700 ease-out`}
                strokeWidth={strokeW}
                strokeDasharray={totalPerimeter}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* Circular Background Track */}
              <circle
                cx={totalSize / 2}
                cy={totalSize / 2}
                r={circleRadius}
                fill="none"
                stroke="hsl(var(--border) / 0.45)"
                strokeWidth={strokeW}
              />
              {/* Circular Active Progress Arc */}
              <circle
                cx={totalSize / 2}
                cy={totalSize / 2}
                r={circleRadius}
                fill="none"
                className={`${ringColorClass} transition-all duration-700 ease-out`}
                strokeWidth={strokeW}
                strokeDasharray={totalPerimeter}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      )}

      {/* Avatar Body with Fallback Chain */}
      <div
        className={`relative overflow-hidden flex items-center justify-center transition-transform duration-300 ${
          onClick ? "group-hover:scale-[1.02] active:scale-95" : ""
        } ${shapeClass} ${palette.bg} border ${palette.border} shadow-md`}
        style={{ width: cfg.px, height: cfg.px }}
      >
        {/* Level 1: Image with graceful onError fallback */}
        {hasImage ? (
          <img
            src={src!}
            alt={alt}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : hasInitials ? (
          /* Level 2: Two deterministic initials */
          <span className={`${cfg.text} ${palette.text} font-display tracking-wide font-bold`}>
            {initials}
          </span>
        ) : (
          /* Level 3: Generic User Icon (last resort, never broken box) */
          <User size={cfg.icon} className={`${palette.text} opacity-90`} strokeWidth={2.2} />
        )}
      </div>
    </div>
  );
};

export default LuxeAvatar;
