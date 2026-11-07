"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function SheetOverlay({ className, ...props }, ref) {
  return <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-ink/30 backdrop-blur-xs", className)} {...props} />;
});

type SheetContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
};

const sideClasses: Record<NonNullable<SheetContentProps["side"]>, string> = {
  top: "inset-x-0 top-0 border-b data-[state=closed]:-translate-y-full",
  right: "sheet-right inset-y-0 right-0 h-full w-[min(28rem,calc(100vw-2rem))] border-l data-[state=closed]:translate-x-full",
  bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:translate-y-full",
  left: "inset-y-0 left-0 h-full w-[min(28rem,calc(100vw-2rem))] border-r data-[state=closed]:-translate-x-full",
};

export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent({ side = "right", className, children, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        asChild
        ref={ref}
        className={cn(
          "glass-dialog fixed z-50 flex flex-col gap-4 overflow-y-auto border p-6 text-ink shadow-xl outline-none transition-transform duration-300 ease-in-out data-[state=open]:translate-x-0 data-[state=open]:translate-y-0",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        <Card tint={0.04} className="glass-overlay-panel" radius={0}>
        {children}
        <DialogPrimitive.Close asChild><Button variant="ghost" className="absolute right-4 top-4 size-11 rounded-full p-0" aria-label="Đóng">
          <X size={18} />
        </Button></DialogPrimitive.Close>
        </Card>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 pr-10", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export const SheetTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function SheetTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-ink", className)} {...props} />;
});

export const SheetDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function SheetDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cn("text-sm text-ink/60", className)} {...props} />;
});
