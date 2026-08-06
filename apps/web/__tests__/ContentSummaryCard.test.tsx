/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { ContentSummaryCard } from "../components/content/ContentSummaryCard";
import type { ContentSummaryModel } from "../lib/content/contentDetail.types";
import enMessages from "../messages/en.json";

function renderWithProviders(ui: ReactElement) {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

describe("ContentSummaryCard", () => {
    it("renders split attack/damage buttons with captions", async () => {
        const user = userEvent.setup();
        const onUse = jest.fn();
        const model: ContentSummaryModel = {
            id: "weapon-1",
            kind: "item",
            title: "Longsword",
            badges: [{ label: "Main hand", variant: "muted" }],
            useActions: [
                {
                    kind: "roll",
                    role: "attack",
                    captionKey: "toHitCaption",
                    label: "d20 +5",
                },
                {
                    kind: "roll",
                    role: "damage",
                    captionKey: "damageCaption",
                    label: "1d8 +3",
                },
            ],
        };

        renderWithProviders(
            <ContentSummaryCard
                model={model}
                expandLabel="Expand Longsword"
                onExpand={() => undefined}
                onUse={onUse}
            />
        );

        expect(screen.getByText("Main hand")).toBeInTheDocument();
        expect(screen.queryByText("Equipped")).not.toBeInTheDocument();
        expect(screen.getByText("To hit")).toBeInTheDocument();
        expect(screen.getByText("Damage")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "d20 +5" }));
        expect(onUse).toHaveBeenCalledWith(
            expect.objectContaining({ role: "attack" })
        );

        await user.click(screen.getByRole("button", { name: "1d8 +3" }));
        expect(onUse).toHaveBeenCalledWith(
            expect.objectContaining({ role: "damage" })
        );
    });
});
