/**
 * Fetches Open5e v2 magic items (SRD 2014 potions) into `__tests__/fixtures/items/`.
 * Run: `npx tsx scripts/refreshOpen5eMagicItems.ts` from packages/content.
 *
 * Only `category.key === "potion"` is written in this pass so we do not pull
 * the full ~500 magic-item catalog without grants.
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { fetchAllMagicItems } from "../src/open5e/open5e.client";

const PACKAGE_ROOT = process.env.CONTENT_PKG_ROOT ?? join(__dirname, "..");
const OUT_DIR = join(PACKAGE_ROOT, "__tests__", "fixtures", "items");

async function main() {
    const magicItems = await fetchAllMagicItems({ documentKey: "srd-2014" });
    const potions = magicItems.filter(
        (item) => item.category?.key === "potion"
    );
    mkdirSync(OUT_DIR, { recursive: true });

    for (const item of potions) {
        const safeName = item.key.replace(/[^a-zA-Z0-9_-]/g, "_");
        writeFileSync(
            join(OUT_DIR, `${safeName}.json`),
            `${JSON.stringify(item, null, 2)}\n`,
            "utf-8"
        );
    }

    console.log(
        `Wrote ${potions.length} potion fixtures (${magicItems.length} magic items fetched) to ${OUT_DIR}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
