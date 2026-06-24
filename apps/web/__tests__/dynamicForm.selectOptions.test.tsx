/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useForm } from "react-hook-form";
import { DynamicForm } from "../components/forms/DynamicForm";
import enMessages from "../messages/en.json";

const fields = [
    {
        name: "race",
        labelKey: "fields.race",
        type: "select",
        group: "general",
        options: [
            { value: "elf", label: "Elf" },
            { value: "dwarf", label: "Dwarf" },
        ],
    },
    {
        name: "age",
        labelKey: "fields.age",
        type: "select",
        group: "general",
        options: ["Adult", "Old"],
    },
];

function Harness() {
    const form = useForm();
    return <DynamicForm form={form} fields={fields} />;
}

describe("DynamicForm select options", () => {
    it("renders value/label options with slug values and display labels", () => {
        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <Harness />
            </NextIntlClientProvider>
        );

        const raceSelect = screen.getByLabelText("Race");
        expect(raceSelect).toBeInTheDocument();
        expect(
            screen.getByRole("option", { name: "Elf" })
        ).toHaveValue("elf");
        expect(
            screen.getByRole("option", { name: "Dwarf" })
        ).toHaveValue("dwarf");
    });

    it("keeps backward compatibility for string[] options", () => {
        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <Harness />
            </NextIntlClientProvider>
        );

        const ageSelect = screen.getByLabelText("Apparent Age");
        expect(ageSelect).toBeInTheDocument();
        expect(
            screen.getByRole("option", { name: "Adult" })
        ).toHaveValue("Adult");
    });
});
