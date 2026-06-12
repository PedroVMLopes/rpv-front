/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useTranslations } from "next-intl";
import enMessages from "../messages/en.json";
import ptMessages from "../messages/pt-BR.json";

function Sample() {
    const t = useTranslations("nav");
    return <span>{t("players")}</span>;
}

function renderWithLocale(locale: "en" | "pt-BR", messages: typeof enMessages) {
    return render(
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Sample />
        </NextIntlClientProvider>
    );
}

describe("i18n UI foundation", () => {
    it("renders English copy for the en locale", () => {
        renderWithLocale("en", enMessages);
        expect(screen.getByText("Players")).toBeInTheDocument();
    });

    it("renders Portuguese copy for the pt-BR locale", () => {
        renderWithLocale("pt-BR", ptMessages);
        expect(screen.getByText("Jogadores")).toBeInTheDocument();
    });

    it("keeps en and pt-BR message files structurally in sync", () => {
        const flatten = (obj: Record<string, unknown>, prefix = ""): string[] =>
            Object.entries(obj).flatMap(([key, val]) => {
                const path = prefix ? `${prefix}.${key}` : key;
                return val && typeof val === "object"
                    ? flatten(val as Record<string, unknown>, path)
                    : [path];
            });

        expect(flatten(ptMessages).sort()).toEqual(flatten(enMessages).sort());
    });
});
