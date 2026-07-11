/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
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
    it("selects race with primary styling", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness />);

        const dwarfCard = screen.getByTestId("catalog-card-dwarf");
        await user.click(dwarfCard);

        expect(screen.getByTestId("race-value")).toHaveTextContent("dwarf");
        expect(dwarfCard.className).toMatch(/bg-primary/);
    });

    it("deselects race on second click", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness defaultValues={{ race: "dwarf" }} />);

        const dwarfCard = screen.getByTestId("catalog-card-dwarf");
        await user.click(dwarfCard);

        expect(screen.getByTestId("race-value")).toHaveTextContent("");
    });

    it("uses responsive grid classes", () => {
        render(<CatalogHarness />);

        const grid = screen.getByTestId("catalog-card-dwarf").parentElement;

        expect(grid?.className).toMatch(/md:grid/);
    });
});
