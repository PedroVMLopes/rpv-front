/**
 * Fetches Open5e v1 races and keeps the pilot set in `__tests__/fixtures/races/`.
 * Run: `npm run refresh:races -w @rpv/content`
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { fetchAllRaces } from "../src/open5e/open5e.client";

const PACKAGE_ROOT = process.env.CONTENT_PKG_ROOT ?? join(__dirname, "..");
const OUT_DIR = join(PACKAGE_ROOT, "__tests__", "fixtures", "races");

/** Races kept for the D&D pilot (existing + Phase A). */
const KEEP_SLUGS = new Set([
    "dwarf",
    "elf",
    "half-elf",
    "human",
    "tiefling",
    "halfling",
]);

async function main() {
    const races = await fetchAllRaces();
    const kept = races.filter((race) => KEEP_SLUGS.has(race.slug));
    mkdirSync(OUT_DIR, { recursive: true });

    for (const race of kept) {
        const safeName = race.slug.replace(/[^a-zA-Z0-9_-]/g, "_");
        writeFileSync(
            join(OUT_DIR, `${safeName}.json`),
            `${JSON.stringify(race, null, 2)}\n`,
            "utf-8"
        );
    }

    const missing = [...KEEP_SLUGS].filter(
        (slug) => !kept.some((race) => race.slug === slug)
    );
    if (missing.length > 0) {
        console.warn(`Missing race slugs from Open5e: ${missing.join(", ")}`);
    }

    console.log(`Wrote ${kept.length} race fixtures to ${OUT_DIR}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
