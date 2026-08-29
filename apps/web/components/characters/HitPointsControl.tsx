"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { LucideHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HealthSlider } from "@/components/ui/HealthSlider";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCharacterStore } from "@/store/useCharacterStore";
import { cn } from "@/lib/utils";
import { getSystemRules } from "@/lib/character/systemRules";
import { buildDeathSaveRollRequest } from "@/lib/roll/buildRollRequest";
import { DeathSavePips } from "@/components/characters/PlayerSheet/combat/DeathSavePips";
import { useOptionalRollAssistant } from "@/components/characters/PlayerSheet/roll/RollAssistantProvider";

const HP_RESOURCE = "hp";

type HitPointsControlProps = {
    characterId: string;
    variant?: "sheet" | "compact";
    className?: string;
};

export function HitPointsControl({
    characterId,
    variant = "sheet",
    className,
}: HitPointsControlProps) {
    const t = useTranslations("playerSheet");
    const updateResource = useCharacterStore((state) => state.updateResource);
    const applyVitalityChange = useCharacterStore(
        (state) => state.applyVitalityChange
    );
    const setCharacterSession = useCharacterStore(
        (state) => state.setCharacterSession
    );
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const stored = useCharacterStore((state) =>
        state.characters.find((character) => character.id === characterId)
    );
    const rollAssistant = useOptionalRollAssistant();

    const currentHp = stored?.resources[HP_RESOURCE] ?? 0;
    const tempHp = stored?.session?.tempHp ?? 0;
    const deathSaves = stored?.session?.deathSaves;
    const resolved = getResolvedStats(characterId);
    const maxHp = resolved?.hitPoints ?? 0;
    const hasVitality = stored
        ? getSystemRules(stored.system).vitality !== undefined
        : false;

    const [draftHp, setDraftHp] = useState(currentHp);
    const [amount, setAmount] = useState<number | undefined>();
    const isDraggingRef = useRef(false);

    useEffect(() => {
        if (!isDraggingRef.current) {
            setDraftHp(currentHp);
        }
    }, [currentHp]);

    const commitHp = (next: number) => {
        const clamped = Math.max(0, Math.min(next, maxHp > 0 ? maxHp : next));
        const diff = clamped - currentHp;
        if (diff !== 0) {
            updateResource(characterId, HP_RESOURCE, diff);
        }
        setDraftHp(clamped);
    };

    const handleSliderChange = (value: number[]) => {
        isDraggingRef.current = true;
        setDraftHp(value[0] ?? 0);
    };

    const handleSliderCommit = (value: number[]) => {
        isDraggingRef.current = false;
        commitHp(value[0] ?? 0);
    };

    const handleDamage = () => {
        if (amount !== undefined && amount > 0) {
            applyVitalityChange(characterId, {
                type: "damage",
                amount,
            });
            setAmount(undefined);
        }
    };

    const handleHeal = () => {
        if (amount !== undefined && amount > 0) {
            applyVitalityChange(characterId, {
                type: "heal",
                amount,
            });
            setAmount(undefined);
        }
    };

    const setTemp = (value: number) => {
        applyVitalityChange(characterId, {
            type: "setTempHp",
            value,
        });
    };

    const handleDeathSaveCounts = (
        successes: number,
        failures: number
    ) => {
        setCharacterSession(characterId, {
            deathSaves:
                successes === 0 && failures === 0
                    ? null
                    : { successes, failures },
        });
    };

    const showSlider = maxHp > 0 || draftHp > 0;
    const sliderMax = Math.max(maxHp, draftHp, 1);
    const showDeathSaves =
        hasVitality && stored !== undefined && currentHp === 0;

    const amountInput = (
        <Input
            type="number"
            min={0}
            inputMode="numeric"
            aria-label={t("amountLabel")}
            className={cn(
                "tabular-nums",
                variant === "compact" ? "h-6 w-14 py-0 text-xs" : "h-8 w-16"
            )}
            value={amount ?? ""}
            onChange={(event) => {
                const next = event.target.value;
                setAmount(next === "" ? undefined : Number(next));
            }}
        />
    );

    const tempRow = hasVitality ? (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase">
                {t("vitality.tempHp")}
            </span>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label={t("vitality.decreaseTemp")}
                    onClick={() => setTemp(tempHp - 1)}
                    disabled={tempHp <= 0}
                >
                    <FaMinus className="size-3" />
                </Button>
                <span
                    className="min-w-6 text-center text-sm font-bold tabular-nums"
                    aria-label={t("vitality.tempHpAria", { value: tempHp })}
                >
                    {tempHp}
                </span>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label={t("vitality.increaseTemp")}
                    onClick={() => setTemp(tempHp + 1)}
                >
                    <FaPlus className="size-3" />
                </Button>
            </div>
        </div>
    ) : null;

    const deathSaveBlock =
        showDeathSaves && stored ? (
            <DeathSavePips
                hp={currentHp}
                saves={deathSaves}
                compact={variant === "compact"}
                onSuccessCount={(count) =>
                    handleDeathSaveCounts(count, deathSaves?.failures ?? 0)
                }
                onFailureCount={(count) =>
                    handleDeathSaveCounts(deathSaves?.successes ?? 0, count)
                }
                onRoll={
                    variant === "sheet" && rollAssistant
                        ? () =>
                              rollAssistant.openRollRequest(
                                  buildDeathSaveRollRequest(
                                      characterId,
                                      t("vitality.deathSaves")
                                  )
                              )
                        : undefined
                }
            />
        ) : null;

    if (variant === "compact") {
        return (
            <div className={cn("flex flex-col gap-1", className)}>
                <div className="flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2 ml-1 font-semibold">
                        <LucideHeart className="size-4 text-destructive" />
                        <p>
                            {draftHp}
                            <span className="opacity-50"> / {maxHp}</span>
                            {tempHp > 0 ? (
                                <span className="ml-1 text-xs font-medium opacity-80">
                                    +{tempHp}
                                </span>
                            ) : null}
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                        <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    onClick={handleDamage}
                                    variant="ghost"
                                    className="size-6 py-0 hover:bg-red-950/30"
                                    aria-label={t("damageAria")}
                                >
                                    <FaMinus className="text-card-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t("damage")}</p>
                            </TooltipContent>
                        </Tooltip>
                        {amountInput}
                        <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    onClick={handleHeal}
                                    variant="ghost"
                                    className="size-6 py-0"
                                    aria-label={t("healAria")}
                                >
                                    <FaPlus className="text-card-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t("heal")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                {showSlider ? (
                    <HealthSlider
                        className="mt-1 px-1"
                        max={sliderMax}
                        step={1}
                        value={[draftHp]}
                        onValueChange={handleSliderChange}
                        onValueCommit={handleSliderCommit}
                    />
                ) : null}
                {tempRow}
                {deathSaveBlock}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex min-w-44 flex-col gap-2 rounded-2xl border-custom bg-accent text-accent-foreground px-3 py-2",
                className
            )}
            aria-label={`${t("hitPoints")} ${draftHp} / ${maxHp}`}
        >
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold font-serif">
                    {t("hitPoints")}
                </span>
                <span className="text-sm font-bold tabular-nums">
                    {draftHp}
                    <span className="font-semibold opacity-60"> / {maxHp}</span>
                    {tempHp > 0 ? (
                        <span className="ml-1 text-xs font-semibold opacity-80">
                            +{tempHp}
                        </span>
                    ) : null}
                </span>
            </div>

            {showSlider ? (
                <HealthSlider
                    max={sliderMax}
                    step={1}
                    value={[draftHp]}
                    onValueChange={handleSliderChange}
                    onValueCommit={handleSliderCommit}
                />
            ) : null}

            <div className="flex items-center gap-1.5">
                <Button
                    type="button"
                    size="sm"
                    className="h-8 flex-1 px-2 text-xs font-semibold bg-emerald-800"
                    onClick={handleHeal}
                    aria-label={t("healAria")}
                >
                    {t("heal")}
                </Button>
                {amountInput}
                <Button
                    type="button"
                    size="sm"
                    className="h-8 flex-1 px-2 text-xs font-semibold bg-red-900"
                    onClick={handleDamage}
                    aria-label={t("damageAria")}
                >
                    {t("damage")}
                </Button>
            </div>
            {tempRow}
            {deathSaveBlock}
        </div>
    );
}
