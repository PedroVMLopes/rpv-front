"use client";

import { Dices } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

export function DiceRollAssistant() {
    const t = useTranslations("playerSheet.roll");
    const { state, openManualRoll, selectDie, submitRollValue, close } =
        useRollAssistant();
    const { open, mode, request, selectedDie, stepIndex, attackRoll, damageRolls } =
        state;

    const handleClose = () => {
        close();
    };

    const completeManualRoll = (sides: number, value: number) => {
        toast(t("toastResult", { sides, value }));
        handleClose();
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
            handleClose();
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
            handleClose();
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
            handleClose();
        }
    };

    const dialogTitle = (() => {
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
                    sides: request.damage.sides,
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
        <>
            {!open ? (
                <Button
                    type="button"
                    size="icon"
                    className="fixed bottom-4 right-4 z-40 size-12 rounded-full shadow-lg"
                    aria-label={t("openFab")}
                    onClick={openManualRoll}
                >
                    <Dices className="size-5" />
                </Button>
            ) : null}

            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        handleClose();
                    }
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="top-auto bottom-4 left-1/2 max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 translate-y-0 overflow-y-auto sm:max-w-lg"
                >
                    <DialogTitle className="text-center text-sm font-medium sm:text-left">
                        {dialogTitle}
                    </DialogTitle>
                    {showDieSelection ? (
                        <DiceSelectStep
                            onSelectDie={selectDie}
                            onCancel={handleClose}
                        />
                    ) : null}
                    {showResultStep && resultSides !== null ? (
                        <DiceResultStep
                            sides={resultSides}
                            onSelectValue={handleSelectValue}
                            onCancel={handleClose}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
