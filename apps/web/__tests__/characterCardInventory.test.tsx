/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import CharacterCardInventory from "../components/characters/CharacterCard/CharacterCardInventory";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";
import enMessages from "../messages/en.json";

jest.mock("../components/ui/characterCarousel", () => ({
    CarouselItem: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="carousel-item">{children}</div>
    ),
}));

const baseAttributes = [
    { name: "strength", value: 10 },
    { name: "dexterity", value: 10 },
    { name: "constitution", value: 14 },
    { name: "intelligence", value: 10 },
    { name: "wisdom", value: 10 },
    { name: "charisma", value: 10 },
];

const baseFormData = {
    name: "Test Hero",
    ac: 12,
    attributes: baseAttributes,
    characterClass: "wizard",
    level: 1,
};

function renderWithProviders(ui: ReactElement) {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

describe("CharacterCardInventory", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    it("shows bag items and raises resolved max HP when equipping amulet", async () => {
        const user = userEvent.setup();

        act(() => {
            useCharacterStore.getState().addCharacter(baseFormData, "player", "dnd");
        });

        const character = useCharacterStore.getState().characters[0];

        act(() => {
            useCharacterStore
                .getState()
                .addToBag(character.id, "amulet-of-vitality");
        });

        renderWithProviders(
            <CharacterCardInventory characterId={character.id} />
        );

        expect(
            screen.getByRole("button", { name: "Remove" })
        ).toBeInTheDocument();
        expect(screen.getByText("Max HP: 8")).toBeInTheDocument();

        const neckEquipSelect = screen.getByLabelText("Equip to Neck");
        await user.selectOptions(neckEquipSelect, "amulet-of-vitality");
        await user.click(screen.getByRole("button", { name: "Equip Neck" }));

        expect(screen.getByText("Max HP: 13")).toBeInTheDocument();
        expect(screen.getByText("No items in bag.")).toBeInTheDocument();
        expect(screen.getByLabelText("Unequip Neck")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Unequip Neck" }));

        expect(screen.getByText("Max HP: 8")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Remove" })
        ).toBeInTheDocument();
    });
});
