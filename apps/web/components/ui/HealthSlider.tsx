import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface HealthSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  thumbClassName?: string;
}

export function HealthSlider({ className, thumbClassName, ...props }: HealthSliderProps) {
  return (
    <SliderPrimitive.Root className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-destructive/70">
        <SliderPrimitive.Range className="absolute h-full bg-chart-4/80" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn("block size-3 rounded-full hover:bg-accent-foreground", thumbClassName)} aria-label="Character Health" />
    </SliderPrimitive.Root>
  );
}
