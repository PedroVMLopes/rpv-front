/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { Grant } from "@rpv/content";
import {
    getClassGrantSourcesForLevel,
} from "@rpv/content";
import { GrantPreviewList } from "../components/characters/creation/GrantPreviewList";
import enMessages from "../messages/en.json";

const fixedSpellGrant: Grant = {
    grantType: "spell",
    choose: 0,
    options: [{ optionType: "spell", ref: "fire-bolt" }],
};

const deferredGrant: Grant = {
    grantType: "language",
    choose: 2,
    selectionFilter: { any: true },
    description: "Two languages",
};

const fixedLanguagesGrant: Grant = {
    grantType: "language",
    choose: 0,
    options: [
        { optionType: "language", ref: "common" },
        { optionType: "language", ref: "dwarvish" },
    ],
};

describe("GrantPreviewList", () => {
    function renderList(grants: Grant[]) {
        return render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <GrantPreviewList
                    grants={grants}
                    contentLocale="en"
                    system="dnd"
                    source={{ type: "background", id: "sage" }}
                />
            </NextIntlClientProvider>
        );
    }

    it("renders fixed spell ref as clickable chip", async () => {
        const user = userEvent.setup();
        renderList([fixedSpellGrant]);

        await user.click(screen.getByRole("button", { name: "Fire Bolt" }));

        expect(await screen.findByRole("dialog")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Fire Bolt" })
        ).toBeInTheDocument();
    });

    it("renders deferred choice copy", () => {
        renderList([deferredGrant]);

        expect(
            screen.getByText(/You will choose 2 later in/i)
        ).toBeInTheDocument();
    });

    it("renders every fixed language from a single grant", () => {
        renderList([fixedLanguagesGrant]);

        expect(screen.getByText("Common")).toBeInTheDocument();
        expect(screen.getByText("Dwarvish")).toBeInTheDocument();
    });

    it("renders multiple fixed contexts without duplicate React keys", () => {
        const consoleError = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const contexts = getClassGrantSourcesForLevel("fighter", 1).flatMap(
            (block) =>
                block.grants.map((grant) => ({
                    grant,
                    source: { type: "class" as const, id: "fighter" },
                    featureLevel: block.featureLevel,
                }))
        );

        render(
            <NextIntlClientProvider locale="en" messages={enMessages}>
                <GrantPreviewList
                    contexts={contexts}
                    contentLocale="en"
                    system="dnd"
                    mode="fixed-only"
                />
            </NextIntlClientProvider>
        );

        const duplicateKeyWarnings = consoleError.mock.calls.filter((call) =>
            String(call[0]).includes("same key")
        );
        expect(duplicateKeyWarnings).toHaveLength(0);

        consoleError.mockRestore();
    });
});
