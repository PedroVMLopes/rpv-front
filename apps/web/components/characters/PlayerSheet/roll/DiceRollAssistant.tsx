"use client";

import { Dices } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { resolveD20TestTotal } from "@/lib/roll/buildRollRequest";
import { formatModifier } from "@/lib/character/skillModifiers";
import type { DieSides } from "@/lib/roll/diceRoll";
import { DiceResultStep } from "./DiceResultStep";
import { DiceSelectStep } from "./DiceSelectStep";
import { useRollAssistant } from "./RollAssistantProvider";

export function DiceRollAssistant() {
    const t = useTranslations("playerSheet.roll");
    const { state, openManualRoll, selectDie, close } = useRollAssistant();
    const { open, mode, request, selectedDie } = state;

    const handleClose = () => {
        close();
    };

    const completeManualRoll = (sides: DieSides, value: number) => {
        toast(t("toastResult", { sides, value }));
        handleClose();
    };

    const completeContextRoll = (dieValue: number) => {
        if (!request || request.kind !== "d20_test") {
            return;
        }

        const total = resolveD20TestTotal(request, dieValue);
        toast(t("contextToast", { label: request.label, total }));
        handleClose();
    };

    const dialogTitle =
        mode === "request" && request?.kind === "d20_test"
            ? t("contextTitle", {
                  label: request.label,
                  modifier: formatModifier(request.modifier),
              })
            : selectedDie === null
              ? t("selectDie")
              : t("pickResult", { sides: selectedDie });

    const showDieSelection = mode === "manual" && selectedDie === null;
    const showResultStep =
        mode === "request" ||
        (mode === "manual" && selectedDie !== null);

    const resultSides =
        mode === "request" && request?.kind === "d20_test"
            ? request.die
            : selectedDie;

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
                            onSelectValue={(value) =>
                                mode === "request"
                                    ? completeContextRoll(value)
                                    : completeManualRoll(resultSides, value)
                            }
                            onCancel={handleClose}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
