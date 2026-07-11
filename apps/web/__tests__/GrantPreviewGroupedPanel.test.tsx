/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import {
    getClassGrantSourcesForLevel,
} from "@rpv/content";
import { GrantPreviewGroupedPanel } from "../components/characters/creation/GrantPreviewGroupedPanel";
import enMessages from "../messages/en.json";

function renderPanel(contexts: Parameters<typeof GrantPreviewGroupedPanel>[0]["contexts"]) {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <GrantPreviewGroupedPanel
                contexts={contexts}
                contentLocale="en"
                system="dnd"
            />
        </NextIntlClientProvider>
    );
}

describe("GrantPreviewGroupedPanel", () => {
    it("groups fighter class preview into weapons and skills", () => {
        const contexts = getClassGrantSourcesForLevel("fighter", 1).flatMap(
            (block) =>
                block.grants.map((grant) => ({
                    grant,
                    source: { type: "class" as const, id: "fighter" },
                    featureLevel: block.featureLevel,
                }))
        );

        renderPanel(contexts);

        expect(screen.getByText("Proficiencies")).toBeInTheDocument();
        expect(screen.getByText("Weapons")).toBeInTheDocument();
        expect(screen.getByText("Skills")).toBeInTheDocument();
        expect(screen.getByText(/Simple Weapons/i)).toBeInTheDocument();
        expect(screen.getByText(/Strength/i)).toBeInTheDocument();
    });

    it("separates wizard cantrips and resources", () => {
        const contexts = [
            ...getClassGrantSourcesForLevel("wizard", 1).flatMap((block) =>
                block.grants.map((grant) => ({
                    grant,
                    source: { type: "class" as const, id: "wizard" },
                    featureLevel: block.featureLevel,
                }))
            ),
            {
                grant: {
                    grantType: "spell" as const,
                    choose: 0,
                    ref: "fire-bolt",
                },
                source: { type: "race" as const, id: "high-elf" },
            },
        ];

        renderPanel(contexts);

        expect(screen.getByText("Cantrips")).toBeInTheDocument();
        expect(screen.getByText("Resources")).toBeInTheDocument();
        expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
        expect(screen.getByText(/Spell Slots/i)).toBeInTheDocument();
    });
});
