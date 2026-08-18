"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import {
    DISPOSITION_FORM_KEY,
    PERSONA_DISPOSITION_AXIS_KEYS,
    PERSONA_DISPOSITION_UNSET_DISPLAY,
    PERSONA_SLIDER_MAX,
    PERSONA_SLIDER_MIN,
    PERSONA_SLIDER_STEP,
    parseDisposition,
    type PersonaDispositionAxisKey,
} from "@/lib/character/personaFields";
import { cn } from "@/lib/utils";

const DISPOSITION_SLIDER_RANGE_CLASSES = [
    "[&_[data-slot=slider-range]]:bg-chart-1",
    "[&_[data-slot=slider-range]]:bg-chart-2",
    "[&_[data-slot=slider-range]]:bg-chart-3",
    "[&_[data-slot=slider-range]]:bg-chart-4",
    "[&_[data-slot=slider-range]]:bg-chart-5",
] as const;

type DispositionFieldsProps = {
    form: UseFormReturn<Record<string, unknown>>;
};

export function DispositionFields({ form }: DispositionFieldsProps) {
    const t = useTranslations("playerSheet.persona");
    const stored = parseDisposition(form.watch(DISPOSITION_FORM_KEY));

    const axisLabel = (key: PersonaDispositionAxisKey) => {
        const left = t(`axes.${key}.left`);
        const right = t(`axes.${key}.right`);
        return `${left} – ${right}`;
    };

    const setAxis = (key: PersonaDispositionAxisKey, value: number) => {
        form.setValue(
            DISPOSITION_FORM_KEY,
            { ...stored, [key]: value },
            { shouldDirty: true, shouldValidate: true }
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-medium leading-none">
                {t("dispositionTitle")}
            </p>
            <ul className="flex flex-col gap-3">
                {PERSONA_DISPOSITION_AXIS_KEYS.map((key, index) => {
                    const storedValue = stored[key];
                    const isSet = storedValue !== undefined;
                    const displayValue =
                        storedValue ?? PERSONA_DISPOSITION_UNSET_DISPLAY;

                    return (
                        <li
                            key={key}
                            className="flex flex-col gap-1.5"
                            role="group"
                            aria-label={axisLabel(key)}
                            data-testid={`disposition-axis-${key}`}
                        >
                            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-muted-foreground">
                                <span>{t(`axes.${key}.left`)}</span>
                                <span className="text-right">
                                    {t(`axes.${key}.right`)}
                                </span>
                            </div>
                            <Slider
                                min={PERSONA_SLIDER_MIN}
                                max={PERSONA_SLIDER_MAX}
                                step={PERSONA_SLIDER_STEP}
                                value={[displayValue]}
                                onValueChange={(next) => {
                                    const nextValue = next[0];
                                    if (typeof nextValue !== "number") {
                                        return;
                                    }
                                    setAxis(key, nextValue);
                                }}
                                aria-label={axisLabel(key)}
                                className={cn(
                                    DISPOSITION_SLIDER_RANGE_CLASSES[index],
                                    !isSet && "opacity-70"
                                )}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
