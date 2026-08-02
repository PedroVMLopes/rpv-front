/**
 * @jest-environment jsdom
 */
import type { ReactElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { emptyInventory } from "@rpv/domain";
import { HitPointsControl } from "../components/characters/HitPointsControl";
import { PlayerSheetHeader } from "../components/characters/PlayerSheet/PlayerSheetHeader";
import { useCharacterStore } from "../store/useCharacterStore";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import enMessages from "../messages/en.json";

jest.mock("../components/ui/HealthSlider", () => ({
    HealthSlider: ({
        onValueChange,
        onValueCommit,
        value,
    }: {
        onValueChange?: (value: number[]) => void;
        onValueCommit?: (value: number[]) => void;
        value?: number[];
    }) => (
        <div>
            <span data-testid="slider-value">{value?.[0]}</span>
            <button type="button" onClick={() => onValueChange?.([5])}>
                drag-slider
            </button>
            <button type="button" onClick={() => onValueCommit?.([5])}>
                commit-slider
            </button>
        </div>
    ),
}));


const storedCharacter: StoredCharacter = {
    id: "char-hp-1",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Sheet Hero",
    baseStats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        armorClass: 14,
        hitPoints: 20,
    },
    modifiers: [],
    grants: [],
    selections: {
        race: "elf",
        characterClass: "fighter",
        inventory: emptyInventory(),
        choices: {},
    },
    resources: { hp: 15 },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

const originalUpdateResource = useCharacterStore.getState().updateResource;

function resetCharacters() {
    useCharacterStore.setState({
        characters: [{ ...storedCharacter, resources: { hp: 15 } }],
    });
}

function renderWithProviders(ui: ReactElement) {
    return render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
            {ui}
        </NextIntlClientProvider>
    );
}

function spyUpdateResource() {
    const spy = jest.fn(
        (id: string, resourceName: string, delta: number) =>
            originalUpdateResource(id, resourceName, delta)
    );
    useCharacterStore.setState({ updateResource: spy });
    return spy;
}

describe("HitPointsControl", () => {
    beforeEach(() => {
        resetCharacters();
        useCharacterStore.setState({ updateResource: originalUpdateResource });
    });

    afterEach(() => {
        act(() => {
            useCharacterStore.setState({
                updateResource: originalUpdateResource,
            });
        });
    });

    it("renders current and max hit points", () => {
        renderWithProviders(
            <HitPointsControl characterId={storedCharacter.id} />
        );

        expect(screen.getByText("Hit Points")).toBeInTheDocument();
        expect(
            screen.getByLabelText(/Hit Points 15 \/ 20/i)
        ).toBeInTheDocument();
    });

    it("applies damage and heal from the amount input once per click", async () => {
        const user = userEvent.setup();
        const updateResource = spyUpdateResource();

        renderWithProviders(
            <HitPointsControl characterId={storedCharacter.id} />
        );

        const amountInput = screen.getByLabelText("Amount");
        fireEvent.change(amountInput, { target: { value: "3" } });
        await user.click(screen.getByRole("button", { name: "Apply damage" }));

        expect(updateResource).toHaveBeenCalledTimes(1);
        expect(updateResource).toHaveBeenCalledWith(
            storedCharacter.id,
            "hp",
            -3
        );
        expect(
            useCharacterStore.getState().characters[0]?.resources.hp
        ).toBe(12);

        updateResource.mockClear();
        fireEvent.change(amountInput, { target: { value: "4" } });
        await user.click(screen.getByRole("button", { name: "Apply healing" }));

        expect(updateResource).toHaveBeenCalledTimes(1);
        expect(updateResource).toHaveBeenCalledWith(
            storedCharacter.id,
            "hp",
            4
        );
        expect(
            useCharacterStore.getState().characters[0]?.resources.hp
        ).toBe(16);
    });

    it("does not write to the store until slider value is committed", async () => {
        const user = userEvent.setup();
        const updateResource = spyUpdateResource();

        renderWithProviders(
            <HitPointsControl characterId={storedCharacter.id} />
        );

        await user.click(screen.getByRole("button", { name: "drag-slider" }));
        expect(updateResource).not.toHaveBeenCalled();
        expect(screen.getByTestId("slider-value")).toHaveTextContent("5");
        expect(
            useCharacterStore.getState().characters[0]?.resources.hp
        ).toBe(15);

        await user.click(screen.getByRole("button", { name: "commit-slider" }));
        expect(updateResource).toHaveBeenCalledTimes(1);
        expect(updateResource).toHaveBeenCalledWith(
            storedCharacter.id,
            "hp",
            -10
        );
        expect(
            useCharacterStore.getState().characters[0]?.resources.hp
        ).toBe(5);
    });
});


describe("PlayerSheetHeader combat stats", () => {
    beforeEach(() => {
        resetCharacters();
        useCharacterStore.setState({ updateResource: originalUpdateResource });
    });

    it("shows interactive HP control and race walk speed", () => {
        renderWithProviders(
            <PlayerSheetHeader
                stored={storedCharacter}
                activeTab="overview"
                onTabChange={() => undefined}
            />
        );

        expect(screen.getByText("Hit Points")).toBeInTheDocument();
        expect(screen.getByText("Speed")).toBeInTheDocument();
        expect(screen.getByText("30 ft")).toBeInTheDocument();
        expect(screen.getByLabelText(/AC 10/i)).toBeInTheDocument();
    });
});
