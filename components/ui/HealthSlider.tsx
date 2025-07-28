import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface HealthSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  thumbClassName?: string;
}

export function HealthSlider({ className, thumbClassName, ...props }: HealthSliderProps) {
  return (
    <SliderPrimitive.Root className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-red-700">
        <SliderPrimitive.Range className="absolute h-full bg-emerald-600" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn("block size-2 rounded-full bg-white", thumbClassName)} />
    </SliderPrimitive.Root>
  );
}
