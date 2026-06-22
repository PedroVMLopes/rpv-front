/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { DerivedResourcesDisplay } from "../components/characters/DerivedResourcesDisplay";
import enMessages from "../messages/en.json";

function renderWithProviders(ui: ReactElement) {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

describe("DerivedResourcesDisplay on character card", () => {
    it("shows translated class resource labels instead of raw slugs", () => {
        renderWithProviders(
            <DerivedResourcesDisplay
                resources={{
                    hp: 10,
                    "rage-uses": 3,
                    "spell-slots-1": 4,
                    "spell-slots-2": 3,
                }}
                compact
            />
        );

        expect(screen.getByText("Rage Uses: 3")).toBeInTheDocument();
        expect(screen.queryByText(/rage-uses/)).not.toBeInTheDocument();
        expect(screen.getByText("Level 1: 4")).toBeInTheDocument();
        expect(screen.getByText("Level 2: 3")).toBeInTheDocument();
    });

    it("returns null when there are no derived resources and no empty hint", () => {
        const { container } = renderWithProviders(
            <DerivedResourcesDisplay resources={{ hp: 10 }} compact />
        );

        expect(container).toBeEmptyDOMElement();
    });
});
