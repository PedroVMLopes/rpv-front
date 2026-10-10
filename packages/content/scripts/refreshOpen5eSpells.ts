/**
 * Fetches Open5e v1 SRD spells (levels 0–3) for wizard/cleric/paladin/druid
 * lists into `__tests__/fixtures/spells/`.
 * Run: `npm run refresh:spells -w @rpv/content`
 */
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { fetchAllSpells } from "../src/open5e/open5e.client";
import type { Open5eSpell } from "../src/open5e/open5e.types";

const PACKAGE_ROOT = process.env.CONTENT_PKG_ROOT ?? join(__dirname, "..");
const OUT_DIR = join(PACKAGE_ROOT, "__tests__", "fixtures", "spells");

const SPELL_LISTS = new Set(["wizard", "cleric", "paladin", "druid"]);
const DOCUMENT_SLUG = "wotc-srd";
const MAX_LEVEL = 3;

/** Racial / subclass spells that live on other class lists in the SRD. */
const FORCE_INCLUDE_SLUGS = new Set([
    "hellish-rebuke",
    "hunters-mark",
    "branding-smite",
]);

function matchesPilotSpell(spell: Open5eSpell): boolean {
    if (spell.document__slug !== DOCUMENT_SLUG) {
        return false;
    }
    if (FORCE_INCLUDE_SLUGS.has(spell.slug)) {
        return spell.level_int >= 0 && spell.level_int <= MAX_LEVEL;
    }
    if (spell.level_int < 0 || spell.level_int > MAX_LEVEL) {
        return false;
    }
    const lists = spell.spell_lists ?? [];
    return lists.some((list) => SPELL_LISTS.has(list));
}

async function main() {
    const bySlug = new Map<string, Open5eSpell>();

    for (let levelInt = 0; levelInt <= MAX_LEVEL; levelInt += 1) {
        const page = await fetchAllSpells({ levelInt });
        for (const spell of page) {
            if (!matchesPilotSpell(spell)) {
                continue;
            }
            bySlug.set(spell.slug, spell);
        }
    }

    mkdirSync(OUT_DIR, { recursive: true });

    for (const file of readdirSync(OUT_DIR).filter((name) =>
        name.endsWith(".json")
    )) {
        unlinkSync(join(OUT_DIR, file));
    }

    for (const spell of bySlug.values()) {
        const safeName = spell.slug.replace(/[^a-zA-Z0-9_-]/g, "_");
        writeFileSync(
            join(OUT_DIR, `${safeName}.json`),
            `${JSON.stringify(spell, null, 2)}\n`,
            "utf-8"
        );
    }

    console.log(`Wrote ${bySlug.size} spell fixtures to ${OUT_DIR}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
