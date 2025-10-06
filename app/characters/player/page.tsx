"use client"

import CharacterCard from "@/components/characters/CharacterCard";
import IniciativeCard from "@/components/iniciative/IniciativeCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";

export default function Players() {
    const characters = useCharacterStore((state) => state.characters);
    const players = characters.filter((c) => c.type === "player");

    return (
        <div className="flex flex-col gap-6 pt-4">

            <div className="flex flex-col md:flex-row space-x-4 gap-4">
                <h1 className="text-4xl font-semibold pl-2">Player Characters</h1>
                <div className="md:border-r" />
                <Link href={"/characters/player/create"}>
                    <Button className="font-bold"> Create New Player </Button>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {players?.map((char) => (
                    <IniciativeCard key={char.id} character={char}/>
                ))}
            </div>

            <CharacterCard />
            
        </div>
    )
}