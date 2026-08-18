"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { DispositionAxisSlider } from "@/components/characters/DispositionAxisSlider";
import {
    DISPOSITION_FORM_KEY,
    PERSONA_DISPOSITION_AXIS_KEYS,
    PERSONA_DISPOSITION_UNSET_DISPLAY,
    parseDisposition,
    type PersonaDispositionAxisKey,
} from "@/lib/character/personaFields";

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
                            <DispositionAxisSlider
                                value={displayValue}
                                colorIndex={index}
                                aria-label={axisLabel(key)}
                                className={!isSet ? "opacity-70" : undefined}
                                onValueChange={(nextValue) =>
                                    setAxis(key, nextValue)
                                }
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
