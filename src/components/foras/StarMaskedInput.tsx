import React, { useState, useEffect, useRef } from "react";

interface StarMaskedInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  isRtl?: boolean;
  showPlain?: boolean;
  dir?: "ltr" | "rtl";
  maxLength?: number;
}

export const StarMaskedInput: React.FC<StarMaskedInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "★★★★★★",
  disabled = false,
  autoFocus = false,
  className = "",
  showPlain = false,
  dir = "ltr",
  maxLength,
}) => {
  const [transientIndex, setTransientIndex] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevLenRef = useRef<number>(value.length);

  useEffect(() => {
    // When characters are added
    if (value.length > prevLenRef.current) {
      const addedIdx = value.length - 1;
      setTransientIndex(addedIdx);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setTransientIndex(null);
      }, 1000);
    } else if (value.length < prevLenRef.current) {
      // Deletion occurred
      setTransientIndex(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    prevLenRef.current = value.length;
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Compute displayed text with star masking
  const displayString = showPlain
    ? value
    : value
        .split("")
        .map((char, i) => (i === transientIndex ? char : "★"))
        .join("");

  return (
    <input
      id={id}
      type="text"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck="false"
      disabled={disabled}
      autoFocus={autoFocus}
      maxLength={maxLength}
      value={displayString}
      placeholder={placeholder}
      onChange={e => {
        const raw = e.target.value;
        if (showPlain) {
          onChange(raw);
          return;
        }

        if (raw.length === 0) {
          onChange("");
        } else if (raw.length > value.length) {
          // New character typed or appended
          const added = raw.slice(value.length);
          onChange(value + added);
        } else if (raw.length < value.length) {
          // Character(s) deleted from end
          const diff = value.length - raw.length;
          onChange(value.slice(0, -diff));
        } else {
          // Direct replace
          onChange(raw);
        }
      }}
      className={`font-mono tracking-[0.18em] sm:tracking-[0.24em] text-xs sm:text-sm font-semibold ${className}`}
      dir={dir}
    />
  );
};
