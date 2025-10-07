"use client"

import * as React from "react";
import { Button } from "../../ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";

import { FaHeart, FaBookmark, FaCopy, FaShield, FaExpand } from "react-icons/fa6";
import CharacterCardInfoBlocks from "./CharacterCardInfoBlocks";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/characterCarousel";
import CharacterCardGameInfo from "./CharacterCardGameInfo";
import CharacterCardInventory from "./CharacterCardInventory";
import CharacterCardAbilities from "./CharacterCardAbilities";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CharacterCard() {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)
    const [pageName, setPageName] = React.useState("");

    React.useEffect(() => {
        switch (current) {
            case 1:
                setPageName("Character Info")
                break;
            case 2:
                setPageName("Skills")
                break;
            case 3:
                setPageName("Actions & Abilities")
                break;
            case 4:
                setPageName("Inventory")
                break;
        }
    }, [current]);
    

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
        <Card className="p-3 sm:max-w-xs gap-3">
            <CardHeader className="p-0 pl-1 flex flex-row items-center justify-between">
                <CardTitle className="font-bold text-lg">Alma la Verne <span className="text-sm opacity-50 font-semibold">lv 1</span></CardTitle>
                <CardAction className="flex flex-row gap-0">
                    <Button variant={"ghost"} className="font-bold">10<FaHeart /></Button>
                    <Button size={"icon"} variant={"ghost"}><FaBookmark /></Button>

                    {/* Dialog Expanded */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size={"icon"} variant={"outline"}><FaExpand /></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm h-[90%] flex flex-col items-center p-3 sm:p-6">

                            <DialogHeader>
                                <DialogTitle className="font-bold text-lg">Alma la Verne <span className="text-sm opacity-50 font-semibold">lv 1</span></DialogTitle>
                            </DialogHeader>

                            {/* Dialog Img & Info */}
                            <div className="flex flex-col items-center justify-center overflow-hidden rounded-2xl max-h-96 max-w-96 relative">
                                <img src={`https://i.imgur.com/8FXMtTG.png`} className="relative"></img>
                                {/* HP & AC Icons */}
                                <div className="absolute bottom-1 left-1 flex flex-col gap-0.5">
                                    <div className="flex flex-row items-center backdrop-blur bg-black/15 rounded-2xl p-0.5 px-1.5 font-bold">
                                        <FaHeart className="mr-1" /> 5 <span className="opacity-60">/10</span>
                                    </div>
                                    <div className="flex flex-row items-center backdrop-blur-2xl bg-black/15 rounded-2xl p-0.5 px-1.5 font-bold">
                                        <FaShield className="mr-1" /> 10
                                    </div>
                                </div>
                            </div>

                            {/* Dialog Carousel */}
                            <Carousel className="w-full" setApi={setApi} opts={{loop: true}}>
                                <CarouselPrevious />
                                <CarouselNext />
                                <div className="text-muted-foreground text-center text-sm pb-1 mb-3">
                                    {pageName}
                                </div>

                                <ScrollArea className="h-80 rounded-2xl">
                                    <CarouselContent>

                                        <CharacterCardInfoBlocks />

                                        <CharacterCardGameInfo />

                                        <CharacterCardAbilities />

                                        <CharacterCardInventory />

                                    </CarouselContent>
                                </ScrollArea>
                            </Carousel>

                            <DialogFooter className="my-0 w-full">
                                <DialogClose asChild>
                                    <Button variant={"destructive"}>Close</Button>
                                </DialogClose>
                                <Button>Clone & Save</Button>
                            </DialogFooter>

                        </DialogContent>
                    </Dialog>

                </CardAction>
            </CardHeader>

            <CardContent className="p-0 flex flex-col items-center">
                <div className="flex flex-col items-center overflow-hidden rounded-2xl max-h-96 max-w-96 relative">
                    <img src={`https://i.imgur.com/8FXMtTG.png`} className="relative"></img>
                    {/* HP & AC Icons */}
                    <div className="absolute bottom-1 left-1 flex flex-col gap-0.5">
                        <div className="flex flex-row items-center backdrop-blur bg-black/15 rounded-2xl p-0.5 px-1.5 font-bold">
                            <FaHeart className="mr-1" /> 5 <span className="opacity-60">/10</span>
                        </div>
                        <div className="flex flex-row items-center backdrop-blur-2xl bg-black/15 rounded-2xl p-0.5 px-1.5 font-bold">
                            <FaShield className="mr-1" /> 10
                        </div>
                    </div>
                </div>

                    {/* Top Info Blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 w-full">
                        {/* Class & Subclass */}
                        <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground">
                            <p className="font-bold">Human Rogue</p>
                            <p className="text-sm">Circle of the moon</p>
                        </div>
                        {/* Alignment & Background */}
                        <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground">
                            <p className="font-bold">Heremita</p>
                            <p className="text-sm">Neutral Evil</p>
                        </div>
                    </div>

                    {/* Short Description */}
                    <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground w-full">
                        <p className="italic">"Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, deserunt"</p>
                    </div>
                
            </CardContent>
        </Card>
    )
}