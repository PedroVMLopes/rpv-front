"use client"

import { useCharacterStore } from "@/store/useCharacterStore";
import IniciativeCard from "./IniciativeCard";
import IniciativeHeader from "./IniciativeHeader";

export default function Iniciative() {
    const characters = useCharacterStore((state) => state.characters);

    return (
        <div>
            <IniciativeHeader />
            <div className="mt-4 gap-2">
                {characters.map((character) => (
                    <IniciativeCard key={character.id} character={character} />
                ))}
            </div>
        </div>
    )
}