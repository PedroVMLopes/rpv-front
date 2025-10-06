import { Button } from "../ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import { FaHeart, FaBookmark, FaCopy } from "react-icons/fa6";

export default function CharacterCard() {
    return (
        <Card className="max-w-sm">
            <CardHeader>
                <CardTitle>Alma la Verne <span className="text-sm opacity-50">lv 1</span></CardTitle>
                <CardDescription>Class / Subclass</CardDescription>
                <CardAction className="flex flex-row gap-1">
                    <Button size={"sm"} variant={"ghost"}>10<FaHeart /></Button>
                    <Button size={"icon"} variant={"ghost"}><FaBookmark /></Button>
                    <Button size={"icon"} variant={"ghost"}><FaCopy /></Button>
                </CardAction>
            </CardHeader>
            <CardContent>

            </CardContent>
        </Card>
    )
}