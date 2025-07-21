import { LucideEdit, LucideExpand, LucideHeart } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { GiHeartPlus, GiShatteredHeart } from "react-icons/gi";

export default function IniciativeCard() {
    return (
        <div className="flex flex-col bg-card rounded p-2 pr-0 border">
            {/* Header Info */}
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-1 items-center">
                    <Button className="size-6" variant={"ghost"}><LucideExpand className="opacity-50"/></Button>
                    <p className="font-semibold">Nome</p>
                </div>
                <p className="opacity-40 text-sm pr-2">12</p>
            </div>

            <div className="flex flex-col mt-2">
                {/* Health */}
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center gap-2 ml-1">
                        <LucideHeart className="size-4 text-red-800"/>
                        <p>20<span className="opacity-50"> / 20</span></p>
                    </div>
                    <div className="flex flex-row gap-1 items-center">
                        <Button variant="ghost" className="text-green-700 py-0 size-8">
                            <GiHeartPlus />
                        </Button>
                        <Input type="number" className="w-16 py-0 h-8"/>
                        <Button variant="ghost" className="text-red-800 py-0 size-8">
                            <GiShatteredHeart />
                        </Button>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}