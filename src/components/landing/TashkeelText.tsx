import React from "react";

// Render Arabic text with diacritics (tashkeel) highlighted in a lighter gold/white
export const TashkeelText: React.FC<{ children: string; className?: string }> = ({
  children,
  className = "",
}) => {
  const chars = Array.from(children);
  return (
    <span className={className}>
      {chars.map((ch, i) => {
        const isHaraka = /[\u064B-\u0652\u0670]/.test(ch);
        if (isHaraka) {
          return (
            <span
              key={i}
              className="text-white/95 transition-all duration-300 group-hover:text-primary-glow group-hover:[text-shadow:0_0_8px_hsl(var(--primary-glow)/0.9)]"
            >
              {ch}
            </span>
          );
        }
        return <span key={i}>{ch}</span>;
      })}
    </span>
  );
};
