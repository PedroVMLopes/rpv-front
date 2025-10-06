"use client"

import { Button } from "../../ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";

import { FaHeart, FaBookmark, FaCopy } from "react-icons/fa6";
import CharacterCardInfoBlocks from "./CharacterCardInfoBlocks";

export default function CharacterCard() {
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

                <CharacterCardInfoBlocks />
            </CardContent>
        </Card>
    )
}