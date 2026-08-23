import type { Grant } from "@rpv/content";
import { buildGrantPreviewItems } from "../lib/character/creation/grantPreviewLabels";
import type { ModifierSource } from "@rpv/domain";

const raceSource: ModifierSource = { type: "race", id: "high-elf" };
const classSource: ModifierSource = { type: "class", id: "fighter" };

const translateAbility = (ref: string) =>
    ({ strength: "Strength", constitution: "Constitution" }[ref] ?? ref);
const translateResource = (ref: string) =>
    ({ "rage-uses": "Rage" }[ref] ?? ref);

function preview(
    grants: Grant[],
    source: ModifierSource = raceSource,
    featureLevel?: number
) {
    return buildGrantPreviewItems(
        grants,
        source,
        "en",
        "dnd",
        translateAbility,
        translateResource,
        featureLevel
    );
}

describe("buildGrantPreviewItems", () => {
    it("defers choosable grants and builds a synthetic pick key", () => {
        const items = preview(
            [
                {
                    grantType: "language",
                    choose: 1,
                    selectionFilter: { any: true },
                    description: "One extra language",
                },
            ],
            raceSource
        );

        expect(items).toEqual([
            expect.objectContaining({
                kind: "deferred",
                id: "deferred-0",
                label: "One extra language",
                choose: 1,
                syntheticKey: "race:high-elf:base:language:0:0",
            }),
        ]);
    });

    it("humanizes deferred grants that have no description", () => {
        const items = preview(
            [
                {
                    grantType: "skill_proficiency",
                    choose: 2,
                    selectionFilter: { any: true },
                },
            ],
            classSource,
            1
        );

        expect(items[0]).toEqual(
            expect.objectContaining({
                kind: "deferred",
                label: "Skill_proficiency choice",
                syntheticKey: "class:fighter:1:skill_proficiency:0:0",
            })
        );
    });

    it("labels a known spell from grant.ref", () => {
        const items = preview([
            {
                grantType: "spell",
                choose: 0,
                ref: "fire-bolt",
            },
        ]);

        expect(items).toEqual([
            {
                kind: "fixed",
                id: "spell-0-fire-bolt",
                label: "Fire Bolt",
                spellRef: "fire-bolt",
                grant: expect.objectContaining({ ref: "fire-bolt" }),
            },
        ]);
    });

    it("resolves a spell ref from options when grant.ref is blank", () => {
        const items = preview([
            {
                grantType: "spell",
                choose: 0,
                ref: "   ",
                options: [{ optionType: "spell", ref: "mage-hand" }],
            },
        ]);

        expect(items[0]).toEqual(
            expect.objectContaining({
                kind: "fixed",
                spellRef: "mage-hand",
                label: "Mage Hand",
                id: "spell-0-mage-hand",
            })
        );
    });

    it("humanizes unknown spell slugs", () => {
        const items = preview([
            {
                grantType: "spell",
                choose: 0,
                ref: "not-a-real-cantrip",
            },
        ]);

        expect(items[0]).toEqual(
            expect.objectContaining({
                kind: "fixed",
                spellRef: "not-a-real-cantrip",
                label: "Not A Real Cantrip",
            })
        );
    });

    it("labels a known inventory item and humanizes unknown slugs", () => {
        const items = preview([
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "srd_leather-armor",
            },
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "not-a-real-item",
            },
        ]);

        expect(items).toEqual([
            expect.objectContaining({
                kind: "fixed",
                id: "item-0-srd_leather-armor",
                label: "Leather Armor",
                itemRef: "srd_leather-armor",
            }),
            expect.objectContaining({
                kind: "fixed",
                id: "item-1-not-a-real-item",
                label: "Not A Real Item",
                itemRef: "not-a-real-item",
            }),
        ]);
    });

    it("formats fixed character grants and falls back to grantType", () => {
        const items = preview(
            [
                {
                    grantType: "saving_throw_proficiency",
                    choose: 0,
                    options: [{ optionType: "stat", ref: "strength" }],
                },
                {
                    grantType: "currency",
                    choose: 0,
                    description: "  ",
                },
            ],
            classSource
        );

        expect(items).toEqual([
            expect.objectContaining({
                kind: "fixed",
                id: "fixed-0-0",
                label: "Strength save",
            }),
            expect.objectContaining({
                kind: "fixed",
                id: "fixed-1",
                label: "Currency",
            }),
        ]);
    });
});
