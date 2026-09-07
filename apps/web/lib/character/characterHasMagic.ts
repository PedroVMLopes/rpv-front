import { getClass, getClassSpellcastingMode } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import { listKnownLeveledSpellRefs } from "./knownLeveledSpells";
import type { StoredCharacter } from "./storedCharacter";

function classHasSpellcasting(classSlug: string | undefined): boolean {
    if (!classSlug) {
        return false;
    }

    const entry = getClass(classSlug);
    if (!entry) {
        return false;
    }

    if (entry.spellcastingAbility || entry.spellcastingMode) {
        return true;
    }

    return getClassSpellcastingMode(classSlug) !== undefined;
}

function hasSpellSlotResources(
    resources: StoredCharacter["resources"]
): boolean {
    return Object.keys(resources).some(
        (ref) => ref.startsWith("spell-slots-") || ref === "pact-slots"
    );
}

function characterLevelFromStored(stored: StoredCharacter): number {
    const raw = stored.systemData.level;
    if (typeof raw === "number" && Number.isFinite(raw) && raw >= 1) {
        return Math.min(Math.floor(raw), 20);
    }
    return 1;
}

/**
 * Whether the player sheet should show the Magic tab.
 * True for any spell grant, class spellcasting, or spell/pact slot resources.
 */
export function characterHasMagic(stored: StoredCharacter): boolean {
    if ((stored.grants ?? []).some((grant) => grant.kind === "spell")) {
        return true;
    }

    const classSlug =
        stored.selections.characterClass ??
        (typeof stored.systemData.characterClass === "string"
            ? stored.systemData.characterClass
            : undefined);

    if (classHasSpellcasting(classSlug)) {
        return true;
    }

    return hasSpellSlotResources(stored.resources);
}

/**
 * Whether the sheet should offer in-session spell preparation.
 * Mirrors creation step gating for prepared casters.
 */
export function characterCanPrepareSpells(
    stored: StoredCharacter,
    locale: Locale = "en"
): boolean {
    const classSlug =
        stored.selections.characterClass ??
        (typeof stored.systemData.characterClass === "string"
            ? stored.systemData.characterClass
            : undefined);

    if (!classSlug) {
        return false;
    }

    const mode = getClassSpellcastingMode(classSlug);
    if (mode !== "spellbook" && mode !== "prepared-list") {
        return false;
    }

    if (mode === "prepared-list") {
        return Boolean(getClass(classSlug)?.spellcastingAbility);
    }

    return (
        listKnownLeveledSpellRefs({
            selections: stored.selections,
            locale,
            system: stored.system,
            characterLevel: characterLevelFromStored(stored),
        }).length > 0
    );
}
