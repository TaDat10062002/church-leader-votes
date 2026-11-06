"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function SheetOverlay({ className, ...props }, ref) {
  return <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/40", className)} {...props} />;
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
        ref={ref}
        className={cn(
          "fixed z-50 flex flex-col gap-4 overflow-y-auto border-ink/10 bg-white p-6 text-ink shadow-xl outline-none transition-transform duration-300 ease-in-out data-[state=open]:translate-x-0 data-[state=open]:translate-y-0",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-ink/55 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss" aria-label="Đóng">
          <X size={18} />
        </DialogPrimitive.Close>
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
