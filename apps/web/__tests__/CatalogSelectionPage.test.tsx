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

    it("opens modal on card click without selecting until Choose", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness />);

        const dwarfCard = screen.getByTestId("catalog-card-dwarf");
        await user.click(dwarfCard);

        expect(screen.getByTestId("race-value")).not.toHaveTextContent("dwarf");
        expect(
            screen.getByTestId("catalog-detail-placeholder")
        ).toBeInTheDocument();

        const dialog = await screen.findByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", { name: "Cancel" })
        ).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", { name: "Choose" })
        ).toBeInTheDocument();
    });

    it("keeps selection unchanged when Cancel closes the modal", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness defaultValues={{ race: "elf" }} />);

        await user.click(screen.getByTestId("catalog-card-dwarf"));

        const dialog = await screen.findByRole("dialog");
        await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByTestId("race-value")).toHaveTextContent("elf");
        expect(screen.getByTestId("catalog-card-elf").className).toMatch(
            /ring-primary/
        );
    });

    it("applies selection and shows detail panel on Choose", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness />);

        await user.click(screen.getByTestId("catalog-card-dwarf"));

        const dialog = await screen.findByRole("dialog");
        await user.click(within(dialog).getByRole("button", { name: "Choose" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByTestId("race-value")).toHaveTextContent("dwarf");
        expect(screen.getByTestId("catalog-card-dwarf").className).toMatch(
            /ring-primary/
        );
        expect(screen.getByTestId("catalog-detail-panel")).toBeInTheDocument();
        expect(screen.getByText("Proficiencies")).toBeInTheDocument();
        expect(screen.getByText("Speed: 25 ft")).toBeInTheDocument();
        expect(screen.getByText("Darkvision: 60 ft")).toBeInTheDocument();
    });

    it("opens modal with grouped weapons, languages, and resources", async () => {
        const user = userEvent.setup();
        render(<CatalogHarness />);

        await user.click(screen.getByTestId("catalog-card-dwarf"));

        const dialog = await screen.findByRole("dialog");
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

    it("uses responsive grid classes", () => {
        render(<CatalogHarness />);

        const grid = screen.getByTestId("catalog-card-dwarf").parentElement;

        expect(grid?.className).toMatch(/md:grid/);
    });

    it("changes race only after Choose when grant picks exist", async () => {
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

        expect(screen.getByTestId("race-value")).toHaveTextContent("dwarf");

        const dialog = await screen.findByRole("dialog");
        await user.click(within(dialog).getByRole("button", { name: "Choose" }));

        expect(screen.getByTestId("race-value")).toHaveTextContent("elf");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByTestId("catalog-card-elf").className).toMatch(
            /ring-primary/
        );
    });
});
