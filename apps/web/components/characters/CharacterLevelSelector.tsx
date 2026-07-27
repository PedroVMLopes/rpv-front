"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CUSTOM_LEVEL_DEFAULT,
    inferLevelPreset,
    isPresetLevel,
    type LevelPreset,
} from "@/lib/character/levelPreset";
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

    function setLevel(nextLevel: number) {
        form.setValue("level", nextLevel, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function setPreset(nextPreset: LevelPreset) {
        if (nextPreset === "lv1") {
            setLevel(1);
            return;
        }

        if (nextPreset === "lv3") {
            setLevel(3);
            return;
        }

        if (isPresetLevel(level)) {
            setLevel(CUSTOM_LEVEL_DEFAULT);
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

                            setLevel(Math.min(Math.max(parsed, 1), 20));
                        }}
                        aria-label={t("level.customInput")}
                    />
                )}
            </div>
            <p className="text-xs text-muted-foreground">{t("level.hint")}</p>
        </div>
    );
}
