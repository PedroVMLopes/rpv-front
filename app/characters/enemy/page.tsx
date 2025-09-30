"use client"

import IniciativeCard from "@/components/iniciative/IniciativeCard";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";

export default function Enemies() {
    const characters = useCharacterStore((state) => state.characters);
    const enemies = characters.filter((c) => c.type === "enemy")

    return (
        <div className="flex flex-col gap-4 pt-2">
            <Button asChild className="font-semibold">
                <Link href={"/characters/enemy/create"}>Create new Enemy</Link>
            </Button>
            <h1>Enemies</h1>
            <div className="grid grid-cols-2 gap-2">
                {enemies?.map((char) => (
                    <IniciativeCard key={char.id} character={char}/>
                ))}
            </div>
        </div>
    )
}