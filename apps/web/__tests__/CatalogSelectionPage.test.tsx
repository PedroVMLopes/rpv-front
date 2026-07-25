/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { CatalogSelectionPage } from "../components/characters/creation/CatalogSelectionPage";
import enMessages from "../messages/en.json";

function CatalogHarness({
    defaultValues = {},
}: {
    defaultValues?: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });

    return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <CatalogSelectionPage
                formField="race"
                form={form}
                contentLocale="en"
                system="dnd"
            />
            <output data-testid="race-value">{String(form.watch("race"))}</output>
        </NextIntlClientProvider>
    );
}

describe("CatalogSelectionPage", () => {
    it("shows placeholder when nothing is selected", () => {
        render(<CatalogHarness />);

        expect(screen.getByTestId("catalog-detail-placeholder")).toHaveTextContent(
            /Select a race to see/i
        );
    });

    it("selects race with primary border styling", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness />);

        const dwarfCard = screen.getByTestId("catalog-card-dwarf");
        await user.click(dwarfCard);

        expect(screen.getByTestId("race-value")).toHaveTextContent("dwarf");
        expect(dwarfCard.className).toMatch(/border-primary/);
        expect(dwarfCard.className).not.toMatch(/bg-primary/);
    });

    it("shows detail panel after selection", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness />);

        await user.click(screen.getByTestId("catalog-card-dwarf"));

        expect(screen.getByTestId("catalog-detail-panel")).toBeInTheDocument();
        expect(screen.getByText("Proficiencies")).toBeInTheDocument();
        expect(screen.getByText("Speed: 25 ft")).toBeInTheDocument();
        expect(screen.getByText("Darkvision: 60 ft")).toBeInTheDocument();
    });

    it("opens expand modal with grouped weapons, languages, and resources", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness />);

        const dwarfCard = screen.getByTestId("catalog-card-dwarf");
        await user.click(
            within(dwarfCard).getByRole("button", { name: "View details" })
        );

        const dialog = await screen.findByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText("Weapons")).toBeInTheDocument();
        expect(within(dialog).getByText("Languages")).toBeInTheDocument();
        expect(within(dialog).getByText("Resources")).toBeInTheDocument();
        expect(within(dialog).getByText("Speed: 25 ft")).toBeInTheDocument();
        expect(within(dialog).getByText("Darkvision: 60 ft")).toBeInTheDocument();
        expect(within(dialog).getByText("Common")).toBeInTheDocument();
        expect(within(dialog).getByText("Dwarvish")).toBeInTheDocument();
        expect(
            within(dialog).getAllByText(
                "Dwarf Traits Your dwarf character has an assortment of inborn abilities, part and parcel of dwarven nature."
            ).length
        ).toBeGreaterThan(0);
        expect(
            within(dialog).getByText("Your Constitution score increases by 2.")
        ).toBeInTheDocument();
        expect(within(dialog).queryByText(/\*\*_/)).not.toBeInTheDocument();
        expect(within(dialog).queryByText(/## /)).not.toBeInTheDocument();
    });

    it("deselects race on second click", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness defaultValues={{ race: "dwarf" }} />);

        const dwarfCard = screen.getByTestId("catalog-card-dwarf");
        await user.click(dwarfCard);

        expect(screen.getByTestId("race-value")).toHaveTextContent("");
        expect(screen.getByTestId("catalog-detail-placeholder")).toBeInTheDocument();
    });

    it("uses responsive grid classes", () => {
        render(<CatalogHarness />);

        const grid = screen.getByTestId("catalog-card-dwarf").parentElement;

        expect(grid?.className).toMatch(/md:grid/);
    });

    it("applies race change immediately when grant picks exist", async () => {
        const user = userEvent.setup();
        render(
            <CatalogHarness
                defaultValues={{
                    race: "dwarf",
                    characterClass: "fighter",
                    subclass: "fighter-champion",
                    choices: {
                        grantPicks: {
                            "class:fighter:base:skill_proficiency:0:0": "athletics",
                        },
                    },
                }}
            />
        );

        await user.click(screen.getByTestId("catalog-card-elf"));

        expect(screen.getByTestId("race-value")).toHaveTextContent("elf");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByTestId("catalog-card-elf").className).toMatch(
            /border-primary/
        );
    });
});
