/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { NextIntlClientProvider } from "next-intl";
import { ClassResourcesField } from "../components/characters/ClassResourcesField";
import messages from "../messages/en.json";

function ClassResourcesHarness({
    defaultValues,
}: {
    defaultValues: Record<string, unknown>;
}) {
    const form = useForm({ defaultValues });

    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <ClassResourcesField form={form} contentLocale="en" />
            <label>
                Level
                <input
                    aria-label="level-input"
                    type="number"
                    value={String(form.watch("level") ?? "")}
                    onChange={(event) =>
                        form.setValue("level", Number(event.target.value))
                    }
                />
            </label>
        </NextIntlClientProvider>
    );
}

describe("ClassResourcesField", () => {
    const baseAttributes = [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 10 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ];

    it("shows empty hint when no class is selected", () => {
        render(
            <ClassResourcesHarness
                defaultValues={{
                    level: 1,
                    attributes: baseAttributes,
                }}
            />
        );

        expect(
            screen.getByText(
                "Select a class and level to see derived resources."
            )
        ).toBeInTheDocument();
    });

    it("shows wizard spell slots at level 5", () => {
        render(
            <ClassResourcesHarness
                defaultValues={{
                    characterClass: "wizard",
                    level: 5,
                    attributes: baseAttributes,
                }}
            />
        );

        expect(screen.getByText("Level 1: 4")).toBeInTheDocument();
        expect(screen.getByText("Level 2: 3")).toBeInTheDocument();
        expect(screen.getByText("Level 3: 2")).toBeInTheDocument();
        expect(screen.getByText("Level 4: 1")).toBeInTheDocument();
    });

    it("updates spell slot totals when level changes", async () => {
        const user = userEvent.setup();

        render(
            <ClassResourcesHarness
                defaultValues={{
                    characterClass: "wizard",
                    level: 1,
                    attributes: baseAttributes,
                }}
            />
        );

        expect(screen.getByText("Level 1: 2")).toBeInTheDocument();
        expect(screen.queryByText("Level 2: 3")).not.toBeInTheDocument();

        await user.clear(screen.getByLabelText("level-input"));
        await user.type(screen.getByLabelText("level-input"), "5");

        await waitFor(() => {
            expect(screen.getByText("Level 2: 3")).toBeInTheDocument();
        });
    });

    it("shows localized class resource labels for barbarian", () => {
        render(
            <ClassResourcesHarness
                defaultValues={{
                    characterClass: "barbarian",
                    subclass: "barbarian-berserker",
                    level: 5,
                    attributes: baseAttributes,
                }}
            />
        );

        expect(screen.getByText("Rage Uses: 3")).toBeInTheDocument();
    });
});
