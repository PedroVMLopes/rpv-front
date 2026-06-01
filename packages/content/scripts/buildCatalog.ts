/**
 * Builds the committed `data/catalog.json` from the committed raw Open5e
 * snapshots in `__tests__/fixtures`. This keeps the build deterministic and
 * offline. The live client (`fetchAllRaces`/`fetchAllSpells`) is available to
 * refresh those snapshots when expanding the catalog.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import type { Catalog } from "../src/catalog/catalog.types";
import { dndLanguages } from "../src/catalog/languages.seed";
import { dndSkills } from "../src/catalog/skills.seed";
import type { Open5eRace, Open5eSpell } from "../src/open5e/open5e.types";
import { mapOpen5eRace } from "../src/race/race.mapper";
import { mapOpen5eSpell } from "../src/spell/spell.mapper";

const PACKAGE_ROOT = process.env.CONTENT_PKG_ROOT ?? join(__dirname, "..");
const FIXTURES = join(PACKAGE_ROOT, "__tests__", "fixtures");
const OUTPUT = join(PACKAGE_ROOT, "data", "catalog.json");

function readJsonDir<T>(dir: string): T[] {
    return readdirSync(dir)
        .filter((file) => file.endsWith(".json"))
        .map((file) => JSON.parse(readFileSync(join(dir, file), "utf-8")) as T);
}

function bySlug(a: { slug: string }, b: { slug: string }): number {
    return a.slug.localeCompare(b.slug);
}

const rawRaces = readJsonDir<Open5eRace>(join(FIXTURES, "races"));
const rawSpells = readJsonDir<Open5eSpell>(join(FIXTURES, "spells"));

const catalog: Catalog = {
    generatedAt: new Date().toISOString(),
    source: "open5e",
    races: rawRaces.map((race) => mapOpen5eRace(race)).sort(bySlug),
    spells: rawSpells.map(mapOpen5eSpell).sort(bySlug),
    skills: dndSkills,
    languages: dndLanguages,
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`, "utf-8");

console.log(
    `Wrote ${catalog.races.length} races and ${catalog.spells.length} spells to ${OUTPUT}`
);
