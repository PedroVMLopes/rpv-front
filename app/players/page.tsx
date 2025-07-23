"use client"

import { Button } from "@/components/ui/button";
import { useCharacterStore } from "@/store/useCharacterStore";
import Link from "next/link";

export default function Players() {
    const characters = useCharacterStore((state) => state.characters);

    return (
        <div className="flex flex-col">
            <p>Players Page</p>
            <Link href={"/players/create"}>
                <Button>Create New Player</Button>
            </Link>
            <div className="grid grid-cols-2">
                <h1>Characters</h1>
                {characters.map((char) => (
                    <li key={char.id}>
                        <strong>{char.name}</strong> ({char.type})
                    </li>
                ))}
            </div>
        </div>

    )
}