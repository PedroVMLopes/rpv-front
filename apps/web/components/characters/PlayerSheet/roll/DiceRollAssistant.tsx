"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    resolveAttackThenDamageTotal,
    resolveD20TestTotal,
    resolveDamageOnlyTotal,
} from "@/lib/roll/buildRollRequest";
import { formatModifier } from "@/lib/character/skillModifiers";
import { pickD20, type AdvantageMode } from "@/lib/roll/rollRiders";
import { Button } from "@/components/ui/button";
import { DiceResultStep } from "./DiceResultStep";
import { DiceSelectStep } from "./DiceSelectStep";
import {
    getActiveRollSides,
    getRequestPhase,
    useRollAssistant,
} from "./RollAssistantProvider";

type DiceRollAssistantProps = {
    onDismiss: () => void;
};

const ADVANTAGE_MODES: AdvantageMode[] = [
    "normal",
    "advantage",
    "disadvantage",
];

export function DiceRollAssistant({ onDismiss }: DiceRollAssistantProps) {
    const t = useTranslations("playerSheet.roll");
    const {
        state,
        selectDie,
        submitRollValue,
        setAdvantageMode,
    } = useRollAssistant();
    const { mode, request, selectedDie, stepIndex, attackRoll, damageRolls } =
        state;
    const phase = getRequestPhase(state);
    const showAdvantageToggle =
        mode === "request" &&
        (request?.kind === "d20_test" ||
            request?.kind === "attack_then_damage") &&
        state.d20Rolls.length === 0 &&
        state.extraDieRolls.length === 0;

    const handleDismiss = () => {
        onDismiss();
    };

    const completeManualRoll = (sides: number, value: number) => {
        toast(t("toastResult", { sides, value }));
        handleDismiss();
    };

    const handleSelectValue = (value: number) => {
        if (mode === "manual" && selectedDie !== null) {
            completeManualRoll(selectedDie, value);
            return;
        }

        if (mode !== "request" || !request) {
            return;
        }

        if (request.kind === "d20_test") {
            const result = submitRollValue(value);
            if (result === "continue") {
                return;
            }

            const d20Rolls =
                phase?.type === "d20"
                    ? [...state.d20Rolls, value]
                    : state.d20Rolls;
            const extraDieRolls =
                phase?.type === "extra_die"
                    ? [...state.extraDieRolls, value]
                    : state.extraDieRolls;
            const total = resolveD20TestTotal(
                request,
                pickD20(d20Rolls, state.advantageMode),
                extraDieRolls
            );
            toast(t("contextToast", { label: request.label, total }));
            handleDismiss();
            return;
        }

        if (request.kind === "attack_then_damage") {
            if (phase?.type === "d20" || phase?.type === "extra_die") {
                submitRollValue(value);
                return;
            }

            const { attackTotal, damageTotal } = resolveAttackThenDamageTotal(
                request,
                pickD20(state.d20Rolls, state.advantageMode) ||
                    attackRoll ||
                    value,
                value,
                state.extraDieRolls
            );
            toast(
                t("attackDamageToast", {
                    label: request.label,
                    attackTotal,
                    damageTotal,
                })
            );
            handleDismiss();
            return;
        }

        if (request.kind === "damage_only") {
            const nextRolls = [...damageRolls, value];

            if (stepIndex + 1 < request.steps.length) {
                submitRollValue(value);
                return;
            }

            const total = resolveDamageOnlyTotal(request.steps, nextRolls);
            toast(
                t("damageOnlyToast", {
                    label: request.label,
                    total,
                })
            );
            handleDismiss();
        }
    };

    const panelTitle = (() => {
        if (mode === "request" && request) {
            if (phase?.type === "extra_die") {
                return t("extraDieStepTitle", {
                    label: request.label,
                    sides: phase.sides,
                });
            }

            if (request.kind === "d20_test") {
                const modifier = formatModifier(request.modifier);
                if (phase?.type === "d20" && phase.of > 1) {
                    return t("d20PairTitle", {
                        label: request.label,
                        modifier,
                        index: phase.index + 1,
                        of: phase.of,
                    });
                }

                return t("contextTitle", {
                    label: request.label,
                    modifier,
                });
            }

            if (request.kind === "attack_then_damage") {
                if (phase?.type === "d20") {
                    const modifier = formatModifier(request.attack.modifier);
                    if (phase.of > 1) {
                        return t("attackPairTitle", {
                            label: request.label,
                            modifier,
                            index: phase.index + 1,
                            of: phase.of,
                        });
                    }

                    return t("attackStepTitle", {
                        label: request.label,
                        modifier,
                    });
                }

                return t("damageStepTitle", {
                    label: request.label,
                    sides: request.damage.sides ?? 6,
                });
            }

            if (request.kind === "damage_only") {
                const saveDcLabel =
                    request.saveDc !== undefined && stepIndex === 0
                        ? ` (${t("saveDcLabel", { dc: request.saveDc })})`
                        : "";

                return `${t("damageOnlyStepTitle", {
                    label: request.label,
                    index: stepIndex + 1,
                    total: request.steps.length,
                    sides: request.steps[stepIndex]?.sides ?? 6,
                })}${saveDcLabel}`;
            }
        }

        return selectedDie === null
            ? t("selectDie")
            : t("pickResult", { sides: selectedDie });
    })();

    const showDieSelection = mode === "manual" && selectedDie === null;
    const resultSides = getActiveRollSides(state);
    const showResultStep =
        mode === "request" || (mode === "manual" && selectedDie !== null);

    return (
        <div className="flex flex-col gap-3">
            <p className="text-center text-sm font-medium sm:text-left">
                {panelTitle}
            </p>
            {showAdvantageToggle ? (
                <div
                    role="group"
                    aria-label={t("advantageMode")}
                    className="flex flex-wrap justify-center gap-1 sm:justify-start"
                >
                    {ADVANTAGE_MODES.map((entry) => (
                        <Button
                            key={entry}
                            type="button"
                            size="sm"
                            variant={
                                state.advantageMode === entry
                                    ? "default"
                                    : "outline"
                            }
                            aria-pressed={state.advantageMode === entry}
                            onClick={() => setAdvantageMode(entry)}
                        >
                            {t(entry)}
                        </Button>
                    ))}
                </div>
            ) : null}
            {showDieSelection ? (
                <DiceSelectStep onSelectDie={selectDie} />
            ) : null}
            {showResultStep && resultSides !== null ? (
                <DiceResultStep
                    sides={resultSides}
                    onSelectValue={handleSelectValue}
                />
            ) : null}
        </div>
    );
}
