"use client";

import { FrostGlassVariantProp, glassClassName } from "@/lib/glass-variants";
import { cn } from "@/lib/utils";

import { Button } from "../button-base";
import { LiquidGlass } from "./liquid-glass";

type GlassButtonProps = React.ComponentProps<typeof Button> & FrostGlassVariantProp & { surfaceClassName?: string };

function GlassButton({ className, glassVariant = "liquid", surfaceClassName, ...props }: GlassButtonProps) {
  if (glassVariant === "liquid-refract") {
    return (
        <LiquidGlass className={cn("glasscn-surface rounded-2xl", surfaceClassName)}>
        <Button
          data-slot="glass-button"
          data-glass-variant={glassVariant}
          className={cn("text-foreground cursor-pointer bg-transparent border-0 shadow-none", className)}
          {...props}
        />
      </LiquidGlass>
    );
  }

  return (
    <Button
      data-slot="glass-button"
      data-glass-variant={glassVariant}
      className={glassClassName(glassVariant, "text-foreground cursor-pointer", className)}
      {...props}
    />
  );
}

export { GlassButton };
