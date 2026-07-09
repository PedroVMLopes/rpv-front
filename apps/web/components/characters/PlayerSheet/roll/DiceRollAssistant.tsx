"use client";

import { useState } from "react";
import { Dices } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { type DieSides } from "@/lib/roll/diceRoll";
import { DiceResultStep } from "./DiceResultStep";
import { DiceSelectStep } from "./DiceSelectStep";

export function DiceRollAssistant() {
    const t = useTranslations("playerSheet.roll");
    const [open, setOpen] = useState(false);
    const [selectedDie, setSelectedDie] = useState<DieSides | null>(null);

    const handleClose = () => {
        setOpen(false);
        setSelectedDie(null);
    };

    const completeRoll = (sides: DieSides, value: number) => {
        toast(t("toastResult", { sides, value }));
        handleClose();
    };

    return (
        <>
            {!open ? (
                <Button
                    type="button"
                    size="icon"
                    className="fixed bottom-4 right-4 z-40 size-12 rounded-full shadow-lg"
                    aria-label={t("openFab")}
                    onClick={() => setOpen(true)}
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
                    <DialogTitle className="text-center text-sm font-medium">
                        {selectedDie === null
                            ? t("selectDie")
                            : t("pickResult", { sides: selectedDie })}
                    </DialogTitle>
                    {selectedDie === null ? (
                        <DiceSelectStep
                            onSelectDie={setSelectedDie}
                            onCancel={handleClose}
                        />
                    ) : (
                        <DiceResultStep
                            sides={selectedDie}
                            onSelectValue={(value) =>
                                completeRoll(selectedDie, value)
                            }
                            onCancel={handleClose}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
