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
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const currentHp = useCharacterStore(
        (state) =>
            state.characters.find((c) => c.id === characterId)?.resources[
                HP_RESOURCE
            ] ?? 0
    );

    const resolved = getResolvedStats(characterId);
    const maxHp = resolved?.hitPoints ?? 0;

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
            updateResource(characterId, HP_RESOURCE, -amount);
            setAmount(undefined);
        }
    };

    const handleHeal = () => {
        if (amount !== undefined && amount > 0) {
            updateResource(characterId, HP_RESOURCE, amount);
            setAmount(undefined);
        }
    };

    const showSlider = maxHp > 0 || draftHp > 0;
    const sliderMax = Math.max(maxHp, draftHp, 1);

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

    if (variant === "compact") {
        return (
            <div className={cn("flex flex-col gap-1", className)}>
                <div className="flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2 ml-1 font-semibold">
                        <LucideHeart className="size-4 text-destructive" />
                        <p>
                            {draftHp}
                            <span className="opacity-50"> / {maxHp}</span>
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
        </div>
    );
}
