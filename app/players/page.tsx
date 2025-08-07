"use client"

import IniciativeCard from "@/components/iniciative/IniciativeCard";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";

export default function Players() {
    const characters = useCharacterStore((state) => state.characters);
    const players = characters.filter((c) => c.type === "player");

    return (
        <div className="flex flex-col gap-4 pt-2">
            <Button asChild className="font-semibold">
                <Link href={"/players/create"}>Create new Player</Link>
            </Button>
            <h1>Players</h1>
            <div className="grid grid-cols-2 gap-2">
                {players?.map((char) => (
                    <IniciativeCard key={char.id} character={char}/>
                ))}
            </div>
        </div>
    )
}