"use client";

import { FrostGlassVariantProp, glassClassName, glassVariantStyles } from "@/lib/glass-variants";
import { cn } from "@/lib/utils";

import { Item } from "../item";
import { LiquidGlass } from "./liquid-glass";

type GlassItemProps = React.ComponentProps<typeof Item> & FrostGlassVariantProp & { surfaceClassName?: string };

function GlassItem({ className, glassVariant = "subtle", surfaceClassName, ...props }: GlassItemProps) {
  if (glassVariant === "liquid-refract") {
    return (
      <LiquidGlass className={cn("glasscn-surface rounded-2xl", surfaceClassName)}>
        <Item
          data-slot="glass-item"
          data-glass-variant={glassVariant}
          className={cn("text-foreground border-0 bg-transparent shadow-none", className)}
          {...props}
        />
      </LiquidGlass>
    );
  }

  return (
    <Item
      data-slot="glass-item"
      data-glass-variant={glassVariant}
      className={glassClassName(glassVariant, "text-foreground", className)}
      {...props}
    />
  );
}

export { GlassItem };
