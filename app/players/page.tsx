"use client"

import IniciativeCard from "@/components/iniciative/IniciativeCard";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";

export default function Players() {
    const characters = useCharacterStore((state) => state.characters);
    const players = characters.filter((c) => c.type === "player");

    return (
        <div className="flex flex-col">
            <p>Players Page</p>
            <Link href={"/players/create"}>
                <Button>Create New Player</Button>
            </Link>
                <h1>Players</h1>
                <div className="grid grid-cols-2">
                    {players.map((char) => (
                        <IniciativeCard key={char.id}/>
                    ))}
                </div>
        </div>

    )
}