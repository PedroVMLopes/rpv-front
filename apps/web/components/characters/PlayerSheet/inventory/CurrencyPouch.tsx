"use client";

import { useTranslations } from "next-intl";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { contentRepo } from "@/lib/content/contentRepository";
import { getTotalCurrency } from "@/lib/character/materializeCurrencyGrants";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sheetInset } from "../playerSheetSurfaces";

type CurrencyPouchProps = {
    stored: StoredCharacter;
};

export function CurrencyPouch({ stored }: CurrencyPouchProps) {
    const t = useTranslations("playerSheet.inventory");
    const tRoot = useTranslations();
    const setCurrency = useCharacterStore((state) => state.setCurrency);
    const adjustCurrency = useCharacterStore((state) => state.adjustCurrency);
    const liveCurrency = useCharacterStore(
        (state) =>
            state.characters.find((character) => character.id === stored.id)
                ?.selections.currency
    );
    const denoms = contentRepo(stored.system).listCurrencies();
    const amounts = getTotalCurrency({
        ...stored,
        selections: {
            ...stored.selections,
            currency: liveCurrency ?? stored.selections.currency,
        },
    });

    if (denoms.length === 0) {
        return <p className="text-sm text-muted-foreground">—</p>;
    }

    return (
        <ul className="flex flex-col gap-1.5">
            {denoms.map((denom) => {
                const amount = amounts[denom.ref] ?? 0;
                const name = tRoot(denom.labelKey);
                const label = `${name} (${denom.abbreviation})`;

                return (
                    <li
                        key={denom.ref}
                        className={cn(
                            "flex items-center justify-between gap-2 rounded-xl px-2 py-1.5",
                            sheetInset
                        )}
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-tight">
                                {denom.abbreviation}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {name}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                disabled={amount <= 0}
                                aria-label={t("summary.decreaseCurrency", {
                                    name: label,
                                })}
                                onClick={() =>
                                    adjustCurrency(stored.id, denom.ref, -1)
                                }
                            >
                                <FaMinus className="size-3" aria-hidden />
                            </Button>
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
                                value={amount}
                                aria-label={t("summary.currencyAmount", {
                                    name: label,
                                })}
                                className="h-8 w-16 px-1.5 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                onChange={(event) => {
                                    const raw = event.target.value;
                                    if (raw === "") {
                                        setCurrency(stored.id, denom.ref, 0);
                                        return;
                                    }
                                    const parsed = Number.parseInt(raw, 10);
                                    if (Number.isFinite(parsed)) {
                                        setCurrency(
                                            stored.id,
                                            denom.ref,
                                            parsed
                                        );
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={t("summary.increaseCurrency", {
                                    name: label,
                                })}
                                onClick={() =>
                                    adjustCurrency(stored.id, denom.ref, 1)
                                }
                            >
                                <FaPlus className="size-3" aria-hidden />
                            </Button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
