"use client"

import CharacterCard from "@/components/characters/CharacterCard/CharacterCard";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";

export default function Players() {
    const characters = useCharacterStore((state) => state.characters);
    const players = characters.filter((c) => c.type === "player");

    return (
        <div className="flex flex-col gap-6 pt-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <h1 className="text-3xl font-semibold pl-2">Player Characters</h1>
                <Link href={"/characters/player/create"}>
                    <Button className="font-bold"> Create New Player </Button>
                </Link>
            </div>

            {players.length === 0 ? (
                <div className="text-muted-foreground italic px-2">
                    No players yet. Click &quot;Create New Player&quot; to add one.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((p) => (
                        <CharacterCard key={p.id} characterId={p.id} />
                    ))}
                </div>
            )}
        </div>
    );
}
