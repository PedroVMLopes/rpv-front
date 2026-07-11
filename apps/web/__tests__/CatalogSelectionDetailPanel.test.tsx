/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { Grant } from "@rpv/content";
import { CatalogSelectionDetailPanel } from "../components/characters/creation/CatalogSelectionDetailPanel";
import enMessages from "../messages/en.json";

const sampleEntry = {
    slug: "dwarf",
    title: "Dwarf",
    summary: "Short summary",
    detailDescription: "Hardy mountain folk.",
    metadata: {
        speedWalk: 25,
        visionDesc:
            "**_Darkvision._** You can see in dim light within 60 feet of you as if it were bright light.",
    },
    grants: [
        {
            grantType: "skill_proficiency" as const,
            choose: 0,
            options: [{ optionType: "skill" as const, ref: "athletics" }],
        },
    ] satisfies Grant[],
};

describe("CatalogSelectionDetailPanel", () => {
    it("shows placeholder when entry is null", () => {
        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <CatalogSelectionDetailPanel
                    entry={null}
                    selectionKind="race"
                    contentLocale="en"
                    system="dnd"
                    source={null}
                />
            </NextIntlClientProvider>
        );

        expect(screen.getByTestId("catalog-detail-placeholder")).toHaveTextContent(
            /Select a race/i
        );
    });

    it("shows description and grouped grants for selected entry", () => {
        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <CatalogSelectionDetailPanel
                    entry={sampleEntry}
                    selectionKind="race"
                    contentLocale="en"
                    system="dnd"
                    source={{ type: "race", id: "dwarf" }}
                />
            </NextIntlClientProvider>
        );

        expect(screen.getByTestId("catalog-detail-panel")).toBeInTheDocument();
        expect(screen.getByText("Hardy mountain folk.")).toBeInTheDocument();
        expect(screen.queryByText("Description")).not.toBeInTheDocument();
        expect(screen.queryByText("What you get")).not.toBeInTheDocument();
        expect(screen.getByText("Proficiencies")).toBeInTheDocument();
        expect(screen.getByText("Skills")).toBeInTheDocument();
        expect(screen.getByText("Athletics")).toBeInTheDocument();
        expect(screen.getByText("Speed: 25 ft")).toBeInTheDocument();
        expect(screen.getByText("Darkvision: 60 ft")).toBeInTheDocument();
    });
});
