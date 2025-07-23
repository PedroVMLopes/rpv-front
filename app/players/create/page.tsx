"use client"

import { useCharacterStore } from "@/store/useCharacterStore";
import CharacterForm from "@/components/character-form/CharacterForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreatePlayer() {
    const addCharacter = useCharacterStore((state) => state.addCharacter);

    return (
        <div>
            <Link href={"/players"}>
                <Button className="font-semibold" variant={"destructive"}>Cancel</Button>
            </Link>
            <div className="mt-4 w-full flex flex-col items-center">
                <h1 className="mb-4">Create a New Player</h1>
                <CharacterForm 
                    type="player" 
                    onSubmit={(data) => {
                        addCharacter(data, "player");
                    }}
                />
            </div>
        </div>
    )
}