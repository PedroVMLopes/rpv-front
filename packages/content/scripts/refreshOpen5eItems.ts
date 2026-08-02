/**
 * Fetches Open5e v2 items for SRD 2014 into `__tests__/fixtures/items/`.
 * Run: `npx tsx scripts/refreshOpen5eItems.ts` from packages/content.
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { fetchAllItems } from "../src/open5e/open5e.client";

const PACKAGE_ROOT = process.env.CONTENT_PKG_ROOT ?? join(__dirname, "..");
const OUT_DIR = join(PACKAGE_ROOT, "__tests__", "fixtures", "items");

async function main() {
    const items = await fetchAllItems({ documentKey: "srd-2014" });
    mkdirSync(OUT_DIR, { recursive: true });

    for (const item of items) {
        const safeName = item.key.replace(/[^a-zA-Z0-9_-]/g, "_");
        writeFileSync(
            join(OUT_DIR, `${safeName}.json`),
            `${JSON.stringify(item, null, 2)}\n`,
            "utf-8"
        );
    }

    console.log(`Wrote ${items.length} item fixtures to ${OUT_DIR}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
