import { LucideChevronRight, LucideHeart, LucideShield } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { GiHeartPlus, GiShatteredHeart } from "react-icons/gi";

export default function IniciativeCard() {
    return (
        <div className="flex flex-col bg-card rounded-lg p-2 py-1 pr-0 border">
            {/* Header Info */}
            <div className="flex flex-row justify-between items-center pr-1">
                <div className="flex flex-row gap-1 pl-1.5 items-center">
                    <p className="font-semibold">Nome</p>
                </div>
                <Button className="size-6 bg-neutral-400" variant={"default"}><LucideChevronRight className="size-5"/></Button>
            </div>

            <div className="flex flex-col mt-2">
                {/* Shield */}
                <div className="flex flex-row gap-3">
                    <div className="flex flex-row items-center gap-2 ml-1">
                        <LucideShield className="size-4 text-cyan-700"/>
                        <p>10</p>
                    </div>
                </div>

                {/* Health */}
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center gap-2 ml-1">
                        <LucideHeart className="size-4 text-red-800"/>
                        <p>20<span className="opacity-50"> / 20</span></p>
                    </div>
                    {/* Health Controllers */}
                    <div className="flex flex-row gap-1 items-center">
                        <Button variant="ghost" className="py-0 size-8">
                            <GiHeartPlus className="text-emerald-600"/>
                        </Button>
                        <Input type="number" className="w-16 py-0 h-8 border-none"/>
                        <Button variant="ghost" className="py-0 size-8">
                            <GiShatteredHeart className="text-red-700" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}