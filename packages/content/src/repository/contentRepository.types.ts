import type { Locale } from "@rpv/domain";
import type { BackgroundEntry } from "../curation/backgroundGrants.dnd";
import type { ClassEntry } from "../curation/classGrants.dnd";
import type { ItemEntry } from "../curation/itemGrants.dnd";
import type { SubclassEntry } from "../curation/subclassGrants.dnd";
import type { Language } from "../catalog/catalog.types";
import type { RaceCatalogEntry, SubraceCatalogEntry } from "../race/race.types";
import type { SpellCatalogEntry } from "../spell/spell.types";

/**
 * Read-only content access for catalog entries and grant-bearing curation.
 * Grant resolution (Grant[] → modifiers / CharacterGrant[]) stays outside this
 * interface; a future Supabase implementation stores the same JSON shapes.
 *
 * @future Methods may become async when SupabaseContentRepository lands.
 */
export interface ContentRepository {
    readonly system: string;

    listRaces(locale?: Locale): RaceCatalogEntry[];
    getRace(slug: string, locale?: Locale): RaceCatalogEntry | undefined;
    getSubrace(slug: string, locale?: Locale): SubraceCatalogEntry | undefined;
    listSpells(locale?: Locale): SpellCatalogEntry[];
    getSpell(slug: string, locale?: Locale): SpellCatalogEntry | undefined;
    listLanguages(): Language[];
    getLanguage(slug: string): Language | undefined;

    listClasses(locale?: Locale): ClassEntry[];
    getClass(slug: string, locale?: Locale): ClassEntry | undefined;
    listBackgrounds(): BackgroundEntry[];
    getBackground(slug: string): BackgroundEntry | undefined;
    listItems(locale?: Locale): ItemEntry[];
    getItem(slug: string, locale?: Locale): ItemEntry | undefined;
    listSubclassesForClass(classSlug: string, locale?: Locale): SubclassEntry[];
    getSubclass(slug: string, locale?: Locale): SubclassEntry | undefined;
}
