"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    resolveAttackThenDamageTotal,
    resolveD20TestTotal,
    resolveDamageOnlyTotal,
} from "@/lib/roll/buildRollRequest";
import { formatModifier } from "@/lib/character/skillModifiers";
import { DiceResultStep } from "./DiceResultStep";
import { DiceSelectStep } from "./DiceSelectStep";
import {
    getActiveRollSides,
    useRollAssistant,
} from "./RollAssistantProvider";

type DiceRollAssistantProps = {
    onDismiss: () => void;
};

export function DiceRollAssistant({ onDismiss }: DiceRollAssistantProps) {
    const t = useTranslations("playerSheet.roll");
    const { state, selectDie, submitRollValue, close } = useRollAssistant();
    const { mode, request, selectedDie, stepIndex, attackRoll, damageRolls } =
        state;

    const handleDismiss = () => {
        close();
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
            const total = resolveD20TestTotal(request, value);
            toast(t("contextToast", { label: request.label, total }));
            handleDismiss();
            return;
        }

        if (request.kind === "attack_then_damage") {
            if (stepIndex === 0) {
                submitRollValue(value);
                return;
            }

            const { attackTotal, damageTotal } = resolveAttackThenDamageTotal(
                request,
                attackRoll ?? value,
                value
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
            if (request.kind === "d20_test") {
                return t("contextTitle", {
                    label: request.label,
                    modifier: formatModifier(request.modifier),
                });
            }

            if (request.kind === "attack_then_damage") {
                if (stepIndex === 0) {
                    return t("attackStepTitle", {
                        label: request.label,
                        modifier: formatModifier(request.attack.modifier),
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
