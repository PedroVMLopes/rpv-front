"use client"

import CharacterForm from "@/components/character/CharacterForm";
import { Button } from "@/components/ui/button";
import { characterSchema } from "@/lib/zodSchemas";
import Link from "next/link";
import { output } from "zod";

export default function CreatePlayer() {
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
                        console.log("Novo jogador:", data);
                    }}
                />
            </div>
        </div>
    )
}