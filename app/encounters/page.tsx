import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge"

import { GiAnvilImpact } from "react-icons/gi";
import { FaPlus, FaList } from "react-icons/fa6";

export default function Encounters() {
    return (
        <div className="flex flex-col">
            
            <h1 className="text-4xl font-semibold mb-6 pl-2">Encounters & Events</h1>

            <div className="flex flex-col">
                <Card className="grid grid-cols-1 md:grid-cols-2">
                    <CardHeader>
                        <CardTitle className="text-xl">Encounters</CardTitle>
                        <Separator orientation="horizontal" />
                        <CardDescription>Encounters are interactive moments within the game, ranging from combat and puzzles to social interactions and exploration. They can represent <span className="font-bold">Battles, Dungeon Rooms, Vendor NPC's, Traps, Travel Events</span>, or even Moral Dilemmas, giving players diverse ways to experience the adventure.</CardDescription>
                        <div className="flex flex-row mt-2 gap-1">
                            <Badge variant={"secondary"}>Combat</Badge>
                            <Badge variant={"secondary"}>Exploration</Badge>
                            <Badge variant={"secondary"}>Social/Roleplay</Badge>
                            <Badge variant={"secondary"}>Challenge</Badge>
                            <Badge variant={"secondary"}>Narrative</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 justify-center">
                        <Button variant={"outline"} className="w-full "><FaList />Your Encounters</Button>
                        <Button variant={"outline"} className="w-full "><FaPlus />New Encounter</Button>
                        <Button className="w-full"><GiAnvilImpact />Explore Encounters</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}