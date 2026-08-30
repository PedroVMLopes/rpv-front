import type { Locale } from "@rpv/domain";
import type { BackgroundEntry } from "../curation/backgroundGrants.dnd";
import type { ClassEntry } from "../curation/classGrants.dnd";
import type { EquipmentPackBundle } from "../curation/equipmentPacks.dnd";
import type { CurrencyDenomination } from "../curation/currencies.dnd";
import type { EquipmentSlot } from "../curation/equipmentSlots.dnd";
import type { ItemEntry } from "../curation/itemGrants.dnd";
import type { NaturalWeaponEntry } from "../curation/naturalWeapons.dnd";
import type { SubclassEntry } from "../curation/subclassGrants.dnd";
import type { Grant } from "../grant/grant.types";
import type { Language } from "../catalog/catalog.types";
import type { RaceCatalogEntry, SubraceCatalogEntry } from "../race/race.types";
import type { SpellCatalogEntry } from "../spell/spell.types";
import type { FeatEntry } from "../feat/feat.types";
import type { ConditionEntry } from "../condition/condition.types";

/**
 * Read-only content access for catalog entries and grant-bearing curation.
 * Grant resolution (Grant[] → modifiers / CharacterGrant[]) stays outside this
 * interface; a future Supabase implementation stores the same JSON shapes.
 *
 * @future Methods may become async when SupabaseContentRepository lands.
 */
export interface ContentRepository {
    readonly system: string;
    /** Source id for universal combat grants (Dash, Dodge, …). */
    readonly systemCombatSourceId?: string;

    listRaces(locale?: Locale): RaceCatalogEntry[];
    getRace(slug: string, locale?: Locale): RaceCatalogEntry | undefined;
    getSubrace(slug: string, locale?: Locale): SubraceCatalogEntry | undefined;
    listSpells(locale?: Locale): SpellCatalogEntry[];
    getSpell(slug: string, locale?: Locale): SpellCatalogEntry | undefined;
    listLanguages(): Language[];
    getLanguage(slug: string): Language | undefined;

    listClasses(locale?: Locale): ClassEntry[];
    getClass(slug: string, locale?: Locale): ClassEntry | undefined;
    listBackgrounds(locale?: Locale): BackgroundEntry[];
    getBackground(slug: string, locale?: Locale): BackgroundEntry | undefined;
    listItems(locale?: Locale): ItemEntry[];
    getItem(slug: string, locale?: Locale): ItemEntry | undefined;
    listSubclassesForClass(classSlug: string, locale?: Locale): SubclassEntry[];
    getSubclass(slug: string, locale?: Locale): SubclassEntry | undefined;

    listEquipmentSlots(): EquipmentSlot[];
    listCurrencies(): CurrencyDenomination[];
    getNaturalWeapons(locale?: Locale): NaturalWeaponEntry[];
    getSystemCombatGrants(): Grant[];
    getEquipmentPack(key: string): EquipmentPackBundle | undefined;

    listFeats(locale?: Locale): FeatEntry[];
    getFeat(slug: string, locale?: Locale): FeatEntry | undefined;

    listConditions(locale?: Locale): ConditionEntry[];
    getCondition(slug: string, locale?: Locale): ConditionEntry | undefined;
}
