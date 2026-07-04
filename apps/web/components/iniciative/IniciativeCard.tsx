"use client";

import { LucideShield } from "lucide-react";
import { FaChevronRight } from "react-icons/fa6";
import { Button } from "../ui/button";
import { HitPointsControl } from "@/components/characters/HitPointsControl";
import type { StoredCharacter } from "@/store/useCharacterStore";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";

interface IniciativeCardProps {
    character: StoredCharacter;
}

export default function IniciativeCard({ character }: IniciativeCardProps) {
    const getResolvedStats = useCharacterStore((state) => state.getResolvedStats);
    const resolved = getResolvedStats(character.id);
    const ac = resolved?.armorClass ?? 0;

    let textColor = "";
    let backgroundColor = "";
    let backgroundColorHover = "";

    switch (character.type) {
        case "enemy":
            textColor = "text-red-700";
            backgroundColor = "bg-chart-2";
            backgroundColorHover = "hover:bg-chart-2/50";
            break;
        case "player":
            textColor = "text-chart-1";
            backgroundColor = "bg-chart-1";
            backgroundColorHover = "hover:bg-chart-1/50";
            break;
        case "npc":
            textColor = "text-chart-3";
            backgroundColor = "bg-chart-3";
            backgroundColorHover = "hover:bg-chart-3/50";
            break;
    }

    return (
        <div className="flex flex-col rounded-xl border border-stone-800 bg-card p-2 pt-1.5">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-1 pl-1.5">
                    <p className="font-semibold">{character.name}</p>
                </div>
                <Link href={`/characters/${character.type}/edit/${character.id}`}>
                    <Button
                        className={`h-6 w-10 text-card-foreground shadow-2xl ${backgroundColor} ${backgroundColorHover}`}
                    >
                        <FaChevronRight className="size-3 opacity-70 z-0" />
                    </Button>
                </Link>
            </div>

            <div className="mt-2 flex flex-col">
                <div className="ml-1 flex flex-row items-center gap-2 font-semibold">
                    <LucideShield className={`size-4 ${textColor}`} />
                    <p>{ac}</p>
                </div>

                <HitPointsControl
                    characterId={character.id}
                    variant="compact"
                    className="mt-1"
                />
            </div>
        </div>
    );
}
