"use client";

import { type ComponentProps, type ReactNode, useState } from "react";
import { GlassInput as RegistryGlassInput } from "@/components/ui/glasscn/glass-input";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale/locale-provider";

type Props = ComponentProps<"input"> & {
  inputClassName?: string;
  icon?: ReactNode;
};

export function FormInput({
  icon,
  placeholder,
  className,
  inputClassName,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const { t } = useLocale();
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("relative w-full rounded-2xl transition-shadow", focused && "ring-2 ring-moss/50", className)}>
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-ink/50 transition-colors",
            focused && "text-moss",
          )}
        >
          {icon}
        </span>
      )}
      <RegistryGlassInput
        glassVariant="liquid"
        surfaceClassName={cn("w-full rounded-2xl transition-shadow", focused && "ring-2 ring-moss/30")}
        className={cn(
          "h-12 rounded-2xl border-0 bg-transparent px-4 text-base text-ink outline-none placeholder:text-ink/45 focus-visible:border-0 focus-visible:ring-0",
          icon && "pl-12",
          inputClassName,
        )}
        placeholder={placeholder ?? t("inputPlaceholder")}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...props}
      />
    </div>
  );
}
