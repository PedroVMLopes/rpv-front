"use client"

import IniciativeCard from "@/components/iniciative/IniciativeCard";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";

export default function NPCs() {
    const characters = useCharacterStore((state) => state.characters);
    const npcs = characters.filter((c) => c.type === "npc")

    return (
        <div className="flex flex-col gap-4 pt-2">
            <Button asChild className="font-semibold">
                <Link href={"/characters/npc/create"}>Create new NPC</Link>
            </Button>
            <h1>NPCs</h1>
            <div className="grid grid-cols-2 gap-2">
                {npcs?.map((char) => (
                    <IniciativeCard key={char.id} character={char}/>
                ))}
            </div>
        </div>
    )
}