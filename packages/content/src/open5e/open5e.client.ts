import type {
    Open5ePaginated,
    Open5eRace,
    Open5eSpell,
    Open5eV2Item,
} from "./open5e.types";

const OPEN5E_BASE_URL = "https://api.open5e.com/v1";
const OPEN5E_V2_BASE_URL = "https://api.open5e.com/v2";

async function fetchAllPages<T>(initialUrl: string): Promise<T[]> {
    const results: T[] = [];
    let url: string | null = initialUrl;

    while (url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `Open5e request failed (${response.status}) for ${url}`
            );
        }

        const page = (await response.json()) as Open5ePaginated<T>;
        results.push(...page.results);
        url = page.next;
    }

    return results;
}

export function fetchAllRaces(): Promise<Open5eRace[]> {
    return fetchAllPages<Open5eRace>(`${OPEN5E_BASE_URL}/races/?limit=50`);
}

export function fetchAllSpells(
    options: { levelInt?: number } = {}
): Promise<Open5eSpell[]> {
    const params = new URLSearchParams({ limit: "50" });
    if (options.levelInt !== undefined) {
        params.set("level_int", String(options.levelInt));
    }
    return fetchAllPages<Open5eSpell>(
        `${OPEN5E_BASE_URL}/spells/?${params.toString()}`
    );
}

export function fetchAllItems(
    options: { documentKey?: string } = {}
): Promise<Open5eV2Item[]> {
    const params = new URLSearchParams({ limit: "100" });
    if (options.documentKey) {
        params.set("document__key__iexact", options.documentKey);
    }
    return fetchAllPages<Open5eV2Item>(
        `${OPEN5E_V2_BASE_URL}/items/?${params.toString()}`
    );
}
