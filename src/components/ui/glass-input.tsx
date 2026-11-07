"use client";

import { type ComponentProps, type ReactNode, useRef, useState } from "react";
import { GlassSurface, type GlassSurfaceHandle } from "@/components/ui/glass";
import { cn } from "@/lib/utils";

interface GlassInputProps extends ComponentProps<"input"> {
  inputClassName?: string;
  icon?: ReactNode;
  tint?: number;
  radius?: number;
}

export function GlassInput({
  icon,
  tint = 0.04,
  radius = 9999,
  placeholder = "Search…",
  className,
  inputClassName,
  onFocus,
  onBlur,
  ...props
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);
  const surfaceRef = useRef<GlassSurfaceHandle | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    surfaceRef.current?.setTintLift(0.1);
    if (glowRef.current) glowRef.current.style.opacity = "1";
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    surfaceRef.current?.setTintLift(0);
    if (glowRef.current) glowRef.current.style.opacity = "0";
    onBlur?.(e);
  };

  return (
    <GlassSurface
      handleRef={surfaceRef}
      tint={tint}
      radius={radius}
      className={cn("relative", className)}
    >
      {/* Focus glow ring */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
        style={{
          opacity: 0,
          boxShadow: "inset 0 0 0 2px rgba(66,107,83,0.7), 0 0 16px rgba(66,107,83,0.12)",
        }}
      />

      <div className="relative flex items-center gap-2.5 px-4 py-2.5">
        {icon && (
          <span className="shrink-0 text-ink/50 transition-colors duration-150"
            style={{ color: focused ? "#426b53" : undefined }}>
            {icon}
          </span>
        )}
        <input
          className={cn(
            "min-w-0 w-full border-0 bg-transparent p-0 text-base text-ink outline-none placeholder:text-ink/45 focus:ring-0",
            "caret-moss",
            inputClassName,
          )}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
    </GlassSurface>
  );
}
