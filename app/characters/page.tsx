import { CharacterCreationCard } from "@/components/characters/CharacterCreationCard";
import Link from "next/link";

export default function Characters() {
    
    return (
        <div className="flex flex-col mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <CharacterCreationCard type={"Player"} btnTitle="Players" />
                <CharacterCreationCard type={"Enemy"} btnTitle="Enemies" />
                <CharacterCreationCard type={"NPC"} btnTitle="NPCs" />
            </div>
        </div>
    )
}