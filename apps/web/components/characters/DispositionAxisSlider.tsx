"use client";

import { Slider } from "@/components/ui/slider";
import {
    PERSONA_DISPOSITION_UNSET_DISPLAY,
    PERSONA_SLIDER_MAX,
    PERSONA_SLIDER_MIN,
    PERSONA_SLIDER_STEP,
} from "@/lib/character/personaFields";
import { cn } from "@/lib/utils";

const DISPOSITION_SLIDER_RANGE_CLASSES = [
    "[&_[data-slot=slider-range]]:bg-chart-1",
    "[&_[data-slot=slider-range]]:bg-chart-2",
    "[&_[data-slot=slider-range]]:bg-chart-3",
    "[&_[data-slot=slider-range]]:bg-chart-4",
    "[&_[data-slot=slider-range]]:bg-chart-5",
] as const;

const DISPOSITION_SLIDER_THUMB_CLASSES = [
    "size-2.5 border-chart-1 bg-chart-1",
    "size-2.5 border-chart-2 bg-chart-2",
    "size-2.5 border-chart-3 bg-chart-3",
    "size-2.5 border-chart-4 bg-chart-4",
    "size-2.5 border-chart-5 bg-chart-5",
] as const;

type DispositionAxisSliderProps = {
    value: number;
    colorIndex: number;
    "aria-label": string;
    disabled?: boolean;
    className?: string;
    onValueChange?: (value: number) => void;
};

export function DispositionAxisSlider({
    value,
    colorIndex,
    "aria-label": ariaLabel,
    disabled,
    className,
    onValueChange,
}: DispositionAxisSliderProps) {
    return (
        <Slider
            disabled={disabled}
            min={PERSONA_SLIDER_MIN}
            max={PERSONA_SLIDER_MAX}
            step={PERSONA_SLIDER_STEP}
            fillFrom={PERSONA_DISPOSITION_UNSET_DISPLAY}
            value={[value]}
            onValueChange={(next) => {
                const nextValue = next[0];
                if (typeof nextValue !== "number") {
                    return;
                }
                onValueChange?.(nextValue);
            }}
            aria-label={ariaLabel}
            thumbClassName={DISPOSITION_SLIDER_THUMB_CLASSES[colorIndex]}
            className={cn(
                DISPOSITION_SLIDER_RANGE_CLASSES[colorIndex],
                className
            )}
        />
    );
}
