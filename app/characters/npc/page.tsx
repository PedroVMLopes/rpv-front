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

            <div className="flex flex-col md:flex-row space-x-4 gap-4">
                <h1 className="text-4xl font-semibold pl-2">NPC's</h1>
                <div className="md:border-r" />
                <Link href={"/characters/npc/create"}>
                    <Button className="font-bold"> Create New NPC </Button>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {npcs?.map((char) => (
                    <IniciativeCard key={char.id} character={char}/>
                ))}
            </div>
        </div>
    )
}