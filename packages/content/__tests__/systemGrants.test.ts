import { getSystemCombatGrants } from "../src/curation/systemGrants.dnd";

describe("getSystemCombatGrants", () => {
    it("returns the eight SRD combat abilities with action costs for dnd", () => {
        const grants = getSystemCombatGrants("dnd");

        expect(grants).toHaveLength(8);
        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "ability",
                    description: "Grapple",
                    activation: { cost: "action" },
                }),
                expect.objectContaining({
                    grantType: "ability",
                    description: "Shove",
                    activation: { cost: "action" },
                }),
                expect.objectContaining({
                    grantType: "ability",
                    description: "Dash",
                    activation: { cost: "action" },
                }),
                expect.objectContaining({
                    grantType: "ability",
                    description: "Disengage",
                    activation: { cost: "action" },
                }),
                expect.objectContaining({
                    grantType: "ability",
                    description: "Dodge",
                    activation: { cost: "action" },
                }),
                expect.objectContaining({
                    grantType: "ability",
                    description: "Help",
                    activation: { cost: "action" },
                }),
                expect.objectContaining({
                    grantType: "ability",
                    description: "Hide",
                    activation: { cost: "action" },
                }),
                expect.objectContaining({
                    grantType: "ability",
                    description: "Opportunity Attack",
                    activation: { cost: "reaction" },
                }),
            ])
        );
        expect(
            grants.some((grant) => grant.description === "Unarmed Strike")
        ).toBe(false);
    });

    it("returns an empty list for an unknown system", () => {
        expect(getSystemCombatGrants("pf2e")).toEqual([]);
    });
});
