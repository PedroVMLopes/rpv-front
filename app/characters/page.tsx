import { CharacterCreationCard } from "@/components/characters/CharacterCreationCard";
import Link from "next/link";

export default function Characters() {
    let CharacterType = ""
    
    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-3">
                <CharacterCreationCard />
                <Link href="/characters/player">Players</Link>
                <Link href="/characters/enemy">Enemies</Link>
                <Link href="/characters/npc">NPCs</Link>
            </div>
        </div>
    )
}