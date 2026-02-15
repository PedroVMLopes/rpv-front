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

            <div className="flex flex-col md:flex-row space-x-4 gap-4">
                <h1 className="text-4xl font-semibold pl-2">Enemies</h1>
                <div className="md:border-r" />
                <Link href={"/characters/enemy/create"}>
                    <Button className="font-bold"> Create New Enemy </Button>
                </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                {enemies?.map((char) => (
                    <IniciativeCard key={char.id} character={char}/>
                ))}
            </div>
        </div>
    )
}