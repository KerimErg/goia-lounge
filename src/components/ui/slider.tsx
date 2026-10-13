"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

function Slider({ className, value, defaultValue, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const thumbs = (value ?? defaultValue ?? [0]).length;
  return (
    <SliderPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      className={cn("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbs }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block size-5 rounded-full border-2 border-primary bg-background shadow-md transition hover:ring-4 hover:ring-primary/20 focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:outline-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
