"use client"

import * as React from "react";
import { Button } from "../../ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";

import { FaHeart, FaBookmark, FaCopy } from "react-icons/fa6";
import CharacterCardInfoBlocks from "./CharacterCardInfoBlocks";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/characterCarousel";
import CharacterCardGameInfo from "./CharacterCardGameInfo";
import CharacterCardInventory from "./CharacterCardInventory";
import CharacterCardAbilities from "./CharacterCardAbilities";

export default function CharacterCard() {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
        if (!api) {
        return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
        setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    return (
        <Card className="p-3 max-w-[50%] sm:max-w-sm gap-3">
            <CardHeader className="p-0 pl-1 flex flex-row items-center justify-between">
                <CardTitle className="font-bold text-lg">Alma la Verne <span className="text-sm opacity-50 font-semibold">lv 1</span></CardTitle>
                <CardAction className="flex flex-row gap-0">
                    <Button variant={"ghost"}>10<FaHeart /></Button>
                    <Button size={"icon"} variant={"ghost"}><FaBookmark /></Button>
                    <Button size={"icon"} variant={"ghost"}><FaCopy /></Button>
                </CardAction>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col items-center overflow-hidden rounded-2xl max-h-96 max-w-96">
                    <img src={`https://i.imgur.com/8FXMtTG.png`}></img>
                </div>

                <Carousel setApi={setApi}>
                    <CarouselPrevious />
                    <CarouselNext />
                    <div className="text-muted-foreground text-center text-sm pb-1">
                        Page {current} of {count}
                    </div>
                    <CarouselContent>
                        <CarouselItem>
                            <CharacterCardInfoBlocks />
                        </CarouselItem>
                        <CarouselItem>
                            <CharacterCardGameInfo />
                        </CarouselItem>
                        <CarouselItem>
                            <CharacterCardAbilities />
                        </CarouselItem>
                        <CarouselItem>
                            <CharacterCardInventory />
                        </CarouselItem>
                    </CarouselContent>
                </Carousel>

                
            </CardContent>
        </Card>
    )
}