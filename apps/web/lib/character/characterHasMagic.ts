import { resolveSpellcastingProfile } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import { listKnownLeveledSpellRefs } from "./knownLeveledSpells";
import type { StoredCharacter } from "./storedCharacter";

function classHasSpellcasting(
    classSlug: string | undefined,
    subclassSlug?: string
): boolean {
    if (!classSlug) {
        return false;
    }

    const profile = resolveSpellcastingProfile(classSlug, subclassSlug);
    return Boolean(profile.ability || profile.mode);
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
    const subclassSlug =
        stored.selections.subclass ??
        (typeof stored.systemData.subclass === "string"
            ? stored.systemData.subclass
            : undefined);

    if (classHasSpellcasting(classSlug, subclassSlug)) {
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
    const subclassSlug =
        stored.selections.subclass ??
        (typeof stored.systemData.subclass === "string"
            ? stored.systemData.subclass
            : undefined);

    if (!classSlug) {
        return false;
    }

    const profile = resolveSpellcastingProfile(classSlug, subclassSlug);
    if (
        profile.mode !== "spellbook" &&
        profile.mode !== "prepared-list"
    ) {
        return false;
    }

    if (profile.mode === "prepared-list") {
        return Boolean(profile.ability);
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
