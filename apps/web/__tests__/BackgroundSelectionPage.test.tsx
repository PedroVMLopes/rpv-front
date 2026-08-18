/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { BackgroundSelectionPage } from "../components/characters/creation/BackgroundSelectionPage";
import type { FieldConfig } from "../components/forms/DynamicForm";
import { dndCharacterFields } from "../presets/dnd/characterFields";
import enMessages from "../messages/en.json";

jest.mock("../components/characters/creation/CatalogSelectionPage", () => ({
    CatalogSelectionPage: () => <div data-testid="catalog-selection" />,
}));

const SAGE_IDEAL_01 = "Truth first: a beautiful lie is still a lie.";
const SAGE_TRAIT_01 =
    "I annotate the margins of everything I read, including tavern menus.";
const SAGE_TRAIT_02 = "Silence makes me restless; I fill it with a question.";
const ACOLYTE_IDEAL_02 =
    "Charity. I always try to help those in need, regardless of what it costs me. (Good)";

const identityFields = dndCharacterFields.common as FieldConfig[];

function BackgroundPageHarness({
    defaultValues,
}: {
    defaultValues: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });

    return (
        <NextIntlClientProvider locale="en" messages={enMessages}>
            <BackgroundSelectionPage
                form={form}
                contentLocale="en"
                system="dnd"
                identityFields={identityFields}
            />
            <pre data-testid="form-output">
                {JSON.stringify({
                    ideals: form.watch("ideals"),
                    personalityTraits: form.watch("personalityTraits"),
                    backgroundDetails: form.watch("backgroundDetails"),
                    name: form.watch("name"),
                    age: form.watch("age"),
                    goals: form.watch("goals"),
                })}
            </pre>
        </NextIntlClientProvider>
    );
}

describe("BackgroundSelectionPage flavor pickers", () => {
    it("shows bound Sage tables and keeps name, age, and goals on the form", () => {
        render(
            <BackgroundPageHarness
                defaultValues={{
                    background: "sage",
                    name: "Elara",
                    age: "Adult",
                    goals: "Map the archive",
                }}
            />
        );

        expect(screen.getByRole("combobox", { name: "Ideals" })).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "Bonds" })).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "Flaws" })).toBeInTheDocument();
        expect(
            screen.getByRole("combobox", { name: "Personality traits (1/2)" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("combobox", { name: "Personality traits (2/2)" })
        ).toBeInTheDocument();

        expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "Apparent Age" })).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Goals" })).toBeInTheDocument();
        expect(screen.queryByRole("textbox", { name: "Ideals" })).not.toBeInTheDocument();
        expect(
            screen.queryByRole("combobox", { name: "Guild business" })
        ).not.toBeInTheDocument();
        expect(screen.getByTestId("form-output")).toHaveTextContent("Elara");
        expect(screen.getByTestId("form-output")).toHaveTextContent("Adult");
        expect(screen.getByTestId("form-output")).toHaveTextContent("Map the archive");
    });

    it("writes a Sage catalog label into ideals", async () => {
        const user = userEvent.setup();
        render(
            <BackgroundPageHarness defaultValues={{ background: "sage" }} />
        );

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Ideals" }),
            "sage-ideal-01"
        );

        expect(screen.getByTestId("form-output")).toHaveTextContent(SAGE_IDEAL_01);
    });

    it("writes free text when Custom is selected", async () => {
        const user = userEvent.setup();
        render(
            <BackgroundPageHarness defaultValues={{ background: "sage" }} />
        );

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Ideals" }),
            "__custom__"
        );

        const textarea = screen.getByRole("textbox", { name: "Ideals" });
        await user.type(textarea, "I wrote this myself.");

        expect(screen.getByTestId("form-output")).toHaveTextContent(
            "I wrote this myself."
        );
    });

    it("joins two personality trait slots with a newline", async () => {
        const user = userEvent.setup();
        render(
            <BackgroundPageHarness defaultValues={{ background: "sage" }} />
        );

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Personality traits (1/2)" }),
            "sage-trait-01"
        );
        await user.selectOptions(
            screen.getByRole("combobox", { name: "Personality traits (2/2)" }),
            "sage-trait-02"
        );

        expect(JSON.parse(screen.getByTestId("form-output").textContent ?? "{}"))
            .toEqual(
                expect.objectContaining({
                    personalityTraits: `${SAGE_TRAIT_01}\n${SAGE_TRAIT_02}`,
                })
            );
    });

    it("falls back to DynamicForm identity fields without a background", () => {
        render(<BackgroundPageHarness defaultValues={{}} />);

        expect(screen.getByLabelText("Ideals").tagName).toBe("INPUT");
        expect(screen.getByLabelText("Personality traits").tagName).toBe("INPUT");
        expect(
            screen.queryByRole("combobox", { name: "Ideals" })
        ).not.toBeInTheDocument();
    });

    it("shows bound Acolyte tables and writes a SRD ideal label", async () => {
        const user = userEvent.setup();
        render(
            <BackgroundPageHarness defaultValues={{ background: "acolyte" }} />
        );

        expect(screen.getByRole("combobox", { name: "Ideals" })).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "Bonds" })).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "Flaws" })).toBeInTheDocument();
        expect(
            screen.getByRole("combobox", { name: "Personality traits (1/2)" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("combobox", { name: "Personality traits (2/2)" })
        ).toBeInTheDocument();

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Ideals" }),
            "acolyte-ideal-02"
        );

        expect(screen.getByTestId("form-output")).toHaveTextContent(
            ACOLYTE_IDEAL_02
        );
        expect(
            screen.queryByRole("combobox", { name: "Guild business" })
        ).not.toBeInTheDocument();
    });

    it("shows the guild business picker for Guild Artisan and writes the label", async () => {
        const user = userEvent.setup();
        render(
            <BackgroundPageHarness
                defaultValues={{ background: "guild-artisan" }}
            />
        );

        expect(
            screen.getByRole("combobox", { name: "Guild business" })
        ).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "Ideals" })).toBeInTheDocument();

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Guild business" }),
            "guild-business-01"
        );

        expect(JSON.parse(screen.getByTestId("form-output").textContent ?? "{}"))
            .toEqual(
                expect.objectContaining({
                    backgroundDetails: { "guild-business": "Alchemists" },
                })
            );
    });
});
