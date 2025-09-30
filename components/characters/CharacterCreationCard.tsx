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
                    <Button className="w-full font-bold" variant={"outline"}><FaList /> Your {char.btnTitle}</Button>
                </Link>
                
                <Link href={`/characters/${CharTypeLink}/create/`} className="w-full">
                    <Button className="w-full font-bold" variant={"outline"}><FaPlus />Create New</Button>
                </Link>
                
            </CardFooter>
        </Card>
    )
}