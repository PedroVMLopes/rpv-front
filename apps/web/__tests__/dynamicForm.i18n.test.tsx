/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useForm } from "react-hook-form";
import { DynamicForm } from "../components/forms/DynamicForm";
import enMessages from "../messages/en.json";
import ptMessages from "../messages/pt-BR.json";

const fields = [
    { name: "name", labelKey: "fields.name", type: "text", group: "general" },
    { name: "hp", labelKey: "fields.hp", type: "number", group: "combat" },
];

function Harness() {
    const form = useForm();
    return <DynamicForm form={form} fields={fields} />;
}

function renderForm(locale: "en" | "pt-BR", messages: typeof enMessages) {
    return render(
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Harness />
        </NextIntlClientProvider>
    );
}

describe("DynamicForm label localization", () => {
    it("renders labelKey fields in English", () => {
        renderForm("en", enMessages);
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Hit Points")).toBeInTheDocument();
    });

    it("renders labelKey fields in Portuguese", () => {
        renderForm("pt-BR", ptMessages);
        expect(screen.getByText("Nome")).toBeInTheDocument();
        expect(screen.getByText("Pontos de Vida")).toBeInTheDocument();
    });

    it("localizes the submit button", () => {
        renderForm("pt-BR", ptMessages);
        expect(
            screen.getByRole("button", { name: "Salvar Personagem" })
        ).toBeInTheDocument();
    });
});
