/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { CatalogSelectionPage } from "../components/characters/creation/CatalogSelectionPage";
import enMessages from "../messages/en.json";

function RaceChangeHarness() {
    const form = useForm({
        defaultValues: {
            race: "dwarf",
            characterClass: "fighter",
            subclass: "fighter-champion",
            choices: {
                grantPicks: {
                    "class:fighter:base:skill_proficiency:0:0": "athletics",
                },
            },
        },
    });

    return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <CatalogSelectionPage
                formField="race"
                form={form}
                contentLocale="en"
                system="dnd"
            />
        </NextIntlClientProvider>
    );
}

describe("SelectionChangeConfirmDialog", () => {
    it("confirms race change when grant picks exist", async () => {
        const user = userEvent.setup();
        render(<RaceChangeHarness />);

        await user.click(screen.getByTestId("catalog-card-elf"));

        expect(
            screen.getByRole("dialog", { name: /Change Race/i })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Change anyway" })
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("cancels race change and keeps selection", async () => {
        const user = userEvent.setup();
        render(<RaceChangeHarness />);

        await user.click(screen.getByTestId("catalog-card-elf"));
        await user.click(screen.getByRole("button", { name: "Keep current" }));

        expect(screen.getByTestId("catalog-card-dwarf").className).toMatch(
            /bg-primary/
        );
    });
});
