"use client";

import { useTranslations } from "next-intl";
import { contentRepo } from "@/lib/content/contentRepository";
import { getTotalCurrency } from "@/lib/character/materializeCurrencyGrants";
import type { StoredCharacter } from "@/lib/character/storedCharacter";
import { useCharacterStore } from "@/store/useCharacterStore";
import { CurrencyStone } from "./CurrencyStone";

type CurrencyPouchProps = {
    stored: StoredCharacter;
};

export function CurrencyPouch({ stored }: CurrencyPouchProps) {
    const t = useTranslations("playerSheet.inventory");
    const tRoot = useTranslations();
    const setCurrency = useCharacterStore((state) => state.setCurrency);
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
        <div
            className="flex gap-2 overflow-x-auto pb-1 pt-2"
            role="list"
            aria-label={t("summary.currency")}
        >
            {denoms.map((denom) => {
                const amount = amounts[denom.ref] ?? 0;
                const name = tRoot(denom.labelKey);
                const label = `${name} (${denom.abbreviation})`;

                return (
                    <CurrencyStone
                        key={denom.ref}
                        abbreviation={denom.abbreviation}
                        name={name}
                        amount={amount}
                        ariaLabel={t("summary.currencyAmount", { name: label })}
                        onAmountChange={(next) =>
                            setCurrency(stored.id, denom.ref, next)
                        }
                    />
                );
            })}
        </div>
    );
}
