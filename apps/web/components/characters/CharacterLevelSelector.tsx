"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inferLevelPreset, type LevelPreset } from "@/lib/character/levelPreset";
import { readLevelFromForm } from "@/lib/character/level";

type CharacterLevelSelectorProps = {
    form: UseFormReturn<Record<string, unknown>>;
};

const PRESETS: LevelPreset[] = ["lv1", "lv3", "custom"];

export function CharacterLevelSelector({ form }: CharacterLevelSelectorProps) {
    const t = useTranslations("characterCreation");
    const { control } = form;
    const watchedLevel = useWatch({ control, name: "level" });
    const level = readLevelFromForm({ level: watchedLevel });
    const preset = inferLevelPreset(level);

    function setPreset(nextPreset: LevelPreset) {
        if (nextPreset === "lv1") {
            form.setValue("level", 1, { shouldDirty: true, shouldValidate: true });
            return;
        }

        if (nextPreset === "lv3") {
            form.setValue("level", 3, { shouldDirty: true, shouldValidate: true });
            return;
        }

        if (level === 1 || level === 3) {
            form.setValue("level", 2, { shouldDirty: true, shouldValidate: true });
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-bold">{t("level.label")}</span>
            <div className="flex flex-wrap items-center gap-2">
                {PRESETS.map((entry) => (
                    <Button
                        key={entry}
                        type="button"
                        size="sm"
                        variant={preset === entry ? "default" : "outline"}
                        onClick={() => setPreset(entry)}
                    >
                        {t(`level.${entry}`)}
                    </Button>
                ))}
                {preset === "custom" && (
                    <Input
                        type="number"
                        min={1}
                        max={20}
                        className="w-20"
                        value={level}
                        onChange={(event) => {
                            const parsed = Number(event.target.value);
                            if (!Number.isFinite(parsed)) {
                                return;
                            }

                            form.setValue("level", Math.min(Math.max(parsed, 1), 20), {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }}
                        aria-label={t("level.customInput")}
                    />
                )}
            </div>
            <p className="text-xs text-muted-foreground">{t("level.hint")}</p>
        </div>
    );
}
