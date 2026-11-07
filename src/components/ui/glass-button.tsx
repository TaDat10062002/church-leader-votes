"use client";

// WebsiteGlass registry button adapted for the light palette and native refs.
import { type ComponentProps, useEffect, useRef } from "react";
import { GlassSurface, type GlassSurfaceHandle } from "@/components/ui/glass";
import { Track, glide, easeGel, easeSoft, PRESS, RELEASE } from "@/components/ui/glass-motion";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends ComponentProps<"button"> {
  tint?: number;
  variant?: "icon" | "capsule";
}

export function GlassButton({
  tint = 0, variant = "capsule", children, className, disabled,
  onPointerDown, onPointerUp, onPointerLeave, onPointerCancel,
  onKeyDown, onKeyUp, onBlur, ...props
}: GlassButtonProps) {
  const surface = useRef<GlassSurfaceHandle | null>(null);
  const scaleEl = useRef<HTMLSpanElement | null>(null);
  const scale = useRef(new Track(1));

  useEffect(() => {
    const track = scale.current;
    const stop = track.watch((value) => {
      if (scaleEl.current) scaleEl.current.style.scale = String(value);
    });
    return () => { stop(); track.halt(); };
  }, []);

  function animate(pressed: boolean) {
    if (disabled) return;
    surface.current?.setTintLift(pressed ? -0.14 : 0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scale.current.snap(1);
      return;
    }
    glide(scale.current, pressed ? 0.94 : 1, pressed ? PRESS : RELEASE, pressed ? easeGel : easeSoft);
  }

  return <button
    type="button"
    disabled={disabled}
    className={cn(
      "glass-button relative isolate inline-flex shrink-0 items-center justify-center gap-2 text-sm font-semibold outline-none transition-[filter,box-shadow] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45",
      variant === "icon" ? "size-11 rounded-full" : "min-h-11 rounded-2xl px-4 py-2.5",
      className,
    )}
    onPointerDown={(event) => { onPointerDown?.(event); if (!event.defaultPrevented) animate(true); }}
    onPointerUp={(event) => { animate(false); onPointerUp?.(event); }}
    onPointerLeave={(event) => { animate(false); onPointerLeave?.(event); }}
    onPointerCancel={(event) => { animate(false); onPointerCancel?.(event); }}
    onKeyDown={(event) => { onKeyDown?.(event); if (!event.defaultPrevented && (event.key === " " || event.key === "Enter")) animate(true); }}
    onKeyUp={(event) => { animate(false); onKeyUp?.(event); }}
    onBlur={(event) => { animate(false); onBlur?.(event); }}
    {...props}
  >
    <span ref={scaleEl} aria-hidden className="pointer-events-none absolute inset-0 -z-10 block origin-center rounded-[inherit]">
      <GlassSurface handleRef={surface} tint={tint} radius={variant === "icon" ? 999 : 16} className="h-full w-full" />
    </span>
    {children}
  </button>;
}
