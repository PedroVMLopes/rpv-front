"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import type { Locale } from "@rpv/domain";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { listPrepareSpellPool } from "@/lib/character/knownLeveledSpells";
import { getFixedRefsForGrantType } from "@/lib/character/characterGrants";
import { readLevelFromForm } from "@/lib/character/level";
import {
    readPreparedSpellsFromForm,
    togglePreparedSpell,
} from "@/lib/character/preparedSpellForm";
import { computePreparedSpellQuotaFromForm } from "@/lib/character/preparedSpellQuota";
import type { SystemKey } from "@/presets";
import { PreparedSpellPicker } from "./PreparedSpellPicker";

type PreparedSpellChoiceGridProps = {
    form: UseFormReturn<Record<string, unknown>>;
    contentLocale: Locale;
    system: SystemKey;
};

export function PreparedSpellChoiceGrid({
    form,
    contentLocale,
    system,
}: PreparedSpellChoiceGridProps) {
    const t = useTranslations("characterCreation");
    const tPrepare = useTranslations("characterCreation.prepareSpells");

    const formValues = form.watch();
    const preparedSpells = readPreparedSpellsFromForm(form);

    const quota = useMemo(() => {
        return (
            computePreparedSpellQuotaFromForm(
                formValues,
                system,
                contentLocale
            ) ?? 1
        );
    }, [formValues, system, contentLocale]);

    const knownLeveled = useMemo(() => {
        const selections = buildSelectionsFromForm(formValues);
        const characterLevel = readLevelFromForm(formValues);

        return listPrepareSpellPool({
            selections,
            locale: contentLocale,
            system,
            characterLevel,
        });
    }, [formValues, contentLocale, system]);

    const lockedSpells = useMemo(() => {
        const selections = buildSelectionsFromForm(formValues);
        const characterLevel = readLevelFromForm(formValues);

        return getFixedRefsForGrantType(
            selections,
            contentLocale,
            "spell",
            characterLevel,
            system
        );
    }, [formValues, contentLocale, system]);

    const playerPrepared = preparedSpells.filter(
        (slug) => !lockedSpells.has(slug)
    );

    return (
        <PreparedSpellPicker
            pool={knownLeveled}
            prepared={preparedSpells}
            locked={lockedSpells}
            quota={quota}
            contentLocale={contentLocale}
            onToggle={(slug) =>
                togglePreparedSpell(form, slug, {
                    quota,
                })
            }
            countLabel={tPrepare("count", {
                prepared: playerPrepared.length,
                quota,
            })}
            emptyLabel={tPrepare("empty")}
            expandDetailsLabel={t("selection.expandDetails")}
        />
    );
}
