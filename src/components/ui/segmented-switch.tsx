"use client";

import { Tabs } from "@base-ui/react/tabs";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentedSwitchTab<T extends string = string> = {
  value: T;
  label: ReactNode;
  content: ReactNode;
};

export type SegmentedSwitchProps<T extends string = string> = {
  tabs: SegmentedSwitchTab<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  className?: string;
};

export function SegmentedSwitch<T extends string = string>({
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
}: SegmentedSwitchProps<T>) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(
    () => defaultValue ?? tabs[0]?.value,
  );
  const selectedValue = value !== undefined ? value : uncontrolledValue;
  const activeTab = tabs.find((tab) => tab.value === selectedValue) ?? tabs[0];

  const handleValueChange = (nextValue: unknown) => {
    const next = nextValue as T;
    if (value === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  const enter = reduceMotion
    ? { opacity: 0, y: 0, scale: 1 }
    : { opacity: 0, y: 8, scale: 0.98 };
  const shown = { opacity: 1, y: 0, scale: 1 };
  const leave = reduceMotion
    ? { opacity: 0, y: 0, scale: 1 }
    : { opacity: 0, y: -8, scale: 0.98 };

  return (
    <Tabs.Root
      value={activeTab?.value ?? null}
      onValueChange={handleValueChange}
      className={cn("w-full", className)}
    >
      <Tabs.List className="inline-flex w-full items-center rounded-lg bg-muted p-1 shadow-inner">
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className="relative isolate flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors data-[active]:bg-transparent data-[active]:text-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            render={
              <motion.button
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              />
            }
          >
            {tab.value === activeTab?.value && (
              <motion.span
                aria-hidden="true"
                layoutId={reduceMotion ? undefined : `segmented-switch-${id}-thumb`}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="segmented-switch-thumb absolute inset-0 -z-10 rounded-md bg-background shadow-md"
              >
                {!reduceMotion && (
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={tab.value}
                      aria-hidden="true"
                      className="segmented-switch-glint"
                      initial={{ x: "-140%", opacity: 0 }}
                      animate={{ x: "320%", opacity: [0, 0.48, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.65, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                )}
              </motion.span>
            )}
            <span className="relative">{tab.label}</span>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {activeTab && (
        <Tabs.Panel value={activeTab.value} className="mt-4 outline-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab.value}
              initial={enter}
              animate={shown}
              exit={leave}
              transition={{ duration: 0.15 }}
            >
              {activeTab.content}
            </motion.div>
          </AnimatePresence>
        </Tabs.Panel>
      )}
    </Tabs.Root>
  );
}
