import type { Open5ePaginated, Open5eRace, Open5eSpell } from "./open5e.types";

const OPEN5E_BASE_URL = "https://api.open5e.com/v1";

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
