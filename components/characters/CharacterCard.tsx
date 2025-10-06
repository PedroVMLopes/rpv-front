import { Button } from "../ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import { FaHeart, FaBookmark, FaCopy } from "react-icons/fa6";

export default function CharacterCard() {
    return (
        <Card className="p-3 max-w-sm gap-3">
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
                    <img src={`https://i.imgur.com/8FXMtTG.png`} className=""></img>
                </div>

                {/* Info Blocks */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {/* Class & Subclass */}
                    <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground">
                        <p className="font-bold text-lg">Human Rogue</p>
                        <p className="text-sm">Circle of the moon</p>
                    </div>
                    {/* Alignment & Background */}
                    <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground">
                        <p className="font-bold text-lg">Heremita</p>
                        <p className="text-sm">Neutral Evil</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}