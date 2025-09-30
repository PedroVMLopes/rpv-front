import Link from "next/link";
import { Button } from "../ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator";

import { GiAnvilImpact } from "react-icons/gi";
import { FaPlus, FaList } from "react-icons/fa6";

interface CharType {
    type: string
    btnTitle: string
}

export const CharacterCreationCard = (char: CharType) => {
    const CharTypeLink = char.type.toLowerCase();

    return (
        <Card className="shadow-2xl">
            <CardHeader>
                <CardTitle className="text-3xl font-bold pl-1">{char.type}</CardTitle>
                <Separator className="mt-2 mb-3" orientation="horizontal" />
            </CardHeader>
            <CardFooter className="flex-col gap-2">

                <Link href={`/characters/${CharTypeLink}`} className="w-full">
                    <Button className="w-full font-bold hover:bg-accent hover:text-accent-foreground border" variant={"ghost"}><FaList /> Your {char.btnTitle}</Button>
                </Link>

                <Link href={`/characters/${CharTypeLink}/create/`} className="w-full">
                    <Button className="w-full font-bold hover:bg-accent hover:text-accent-foreground border" variant={"ghost"}><FaPlus />Create New</Button>
                </Link>

                <Link href={"/forge"} className="w-full">
                    <Button className="w-full bg-orange-300/10 hover:bg-accent hover:text-accent-foreground font-bold text-card-foreground border border-orange-300/30"><GiAnvilImpact />Explore {char.btnTitle}</Button>
                </Link>
                
            </CardFooter>
        </Card>
    )
}