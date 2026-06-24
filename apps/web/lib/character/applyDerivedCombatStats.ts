import type { SystemKey } from "@/presets";
import type { Locale } from "@rpv/domain";
import {
    deriveMaxHpFromForm,
    isMaxHpEmpty,
} from "./hp";
import {
    deriveBaseAcFromForm,
    isAcEmpty,
} from "./ac";

function applyDerivedMaxHp(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): Record<string, unknown> {
    if (!isMaxHpEmpty(formData.maxHp)) {
        return formData;
    }

    const derivedMaxHp = deriveMaxHpFromForm(formData, system, locale);
    if (derivedMaxHp === undefined) {
        return formData;
    }

    const processedForm: Record<string, unknown> = {
        ...formData,
        maxHp: derivedMaxHp,
    };

    if (isMaxHpEmpty(formData.hp)) {
        processedForm.hp = derivedMaxHp;
    }

    return processedForm;
}

function applyDerivedAc(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): Record<string, unknown> {
    if (!isAcEmpty(formData.ac)) {
        return formData;
    }

    const derivedAc = deriveBaseAcFromForm(formData, system, locale);
    if (derivedAc === undefined) {
        return formData;
    }

    return {
        ...formData,
        ac: derivedAc,
    };
}

export function applyDerivedCombatStats(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): Record<string, unknown> {
    return applyDerivedAc(
        applyDerivedMaxHp(formData, system, locale),
        system,
        locale
    );
}
