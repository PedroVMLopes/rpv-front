"use client";

import { CarouselItem } from "@/components/ui/characterCarousel";
import { getResolvedStatDisplay } from "@/lib/character/presetStats";
import { useCharacterStore } from "@/store/useCharacterStore";

interface CharacterCardGameInfoProps {
    characterId?: string;
}

export default function CharacterCardGameInfo({ characterId }: CharacterCardGameInfoProps) {
    const getCharacterProps = useCharacterStore((state) => state.getCharacterProps);
    const characters = useCharacterStore((state) => state.characters);
    const props = characterId ? getCharacterProps(characterId) : undefined;
    const stored = characterId ? characters.find((c) => c.id === characterId) : undefined;

    if (!props || !stored) {
        return (
            <CarouselItem>
                <div className="flex flex-col rounded-2xl p-2 px-3 border my-2 text-muted-foreground text-sm">
                    No character selected. Create a player to see resolved stats.
                </div>
            </CarouselItem>
        );
    }

    const display = getResolvedStatDisplay(props, stored.system);

    return (
        <CarouselItem>
            <div className="flex flex-col rounded-2xl p-2 px-3 border my-2 gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        Resolved abilities
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {display.abilities.map((ability) => (
                            <div
                                key={ability.name}
                                className="flex flex-col items-center border rounded-lg p-2 bg-popover"
                            >
                                <span className="text-xs text-muted-foreground">
                                    {ability.shortLabel}
                                </span>
                                <span className="font-bold text-lg">{ability.resolved}</span>
                                {ability.resolved !== ability.base && (
                                    <span className="text-xs text-muted-foreground">
                                        base {ability.base}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    {display.combat.map((combat) => (
                        <div key={combat.statKey} className="border rounded-lg p-2 bg-popover">
                            <span className="text-muted-foreground">{combat.label} </span>
                            <span className="font-bold">{combat.resolved}</span>
                            {combat.resolved !== combat.base && (
                                <span className="text-xs text-muted-foreground ml-1">
                                    (base {combat.base})
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {props.modifiers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {props.modifiers.length} active modifier
                        {props.modifiers.length === 1 ? "" : "s"}
                    </p>
                )}
            </div>
        </CarouselItem>
    );
}
