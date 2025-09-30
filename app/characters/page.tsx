import { CharacterCreationCard } from "@/components/characters/CharacterCreationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { GiAnvilImpact } from "react-icons/gi";

export default function Characters() {
    
    return (
        <div className="flex flex-col mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="flex-col">
                    <CharacterCreationCard type={"Player"} btnTitle="Players" />
                    <Card className="bg-orange-300/10 border-orange-300/50 mt-2 py-3">
                        <CardContent>
                            <Link href={"/forge"}>
                                <Button className="w-full bg-orange-300 font-bold border"><GiAnvilImpact />Explore Player Content</Button>
                            </Link>
                            <p className="text-sm opacity-80 mt-2">Explore new <span className="font-bold">classes, subclasses</span>, and <span className="font-bold">premade characters</span> created by the community.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-col">
                    <CharacterCreationCard type={"Enemy"} btnTitle="Enemies" />
                    <Card className="bg-orange-300/10 border-orange-300/50 mt-2 py-3">
                        <CardContent>
                            <Link href={"/forge"}>
                                <Button className="w-full bg-orange-300 font-bold border"><GiAnvilImpact />Explore Enemies</Button>
                            </Link>
                            <p className="text-sm opacity-80 mt-2">Explore all kinds of homebrew <span className="font-bold">monsters</span> and <span className="font-bold">villains</span> to surprise your players. </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-col">
                    <CharacterCreationCard type={"NPC"} btnTitle="NPCs" />
                    <Card className="bg-orange-300/10 border-orange-300/50 mt-2 py-3">
                        <CardContent>
                            <Link href={"/forge"}>
                                <Button className="w-full bg-orange-300 font-bold border"><GiAnvilImpact />Explore NPC's</Button>
                            </Link>
                            <p className="text-sm opacity-80 mt-2">Explore a list of <span className="font-bold">diverse NPC's</span> that could fit your adventure perfectly. </p>
                        </CardContent>
                    </Card>
                </div>
                
            </div>
        </div>
    )
}