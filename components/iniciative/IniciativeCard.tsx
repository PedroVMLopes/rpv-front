import { LucideChevronRight, LucideHeart, LucideShield } from "lucide-react";
import { GiHeartPlus, GiShatteredHeart } from "react-icons/gi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function IniciativeCard() {
    return (
        <div className="flex flex-col bg-card rounded-lg p-2 pt-1 pr-1 border">
            {/* Header Info */}
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-1 pl-1.5 items-center">
                    <p className="font-semibold">Nome</p>
                </div>
                <Button className="size-6" variant={"default"}><LucideChevronRight className="size-5"/></Button>
            </div>

            <div className="flex flex-col mt-2">
                {/* Shield */}
                <div className="flex flex-row gap-3">
                    <div className="flex flex-row items-center gap-2 ml-1">
                        <LucideShield className="size-4 text-cyan-600"/>
                        <p>10</p>
                    </div>
                </div>

                {/* Health */}
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center gap-2 ml-1">
                        <LucideHeart className="size-4 text-red-600"/>
                        <p>20<span className="opacity-50"> / 20</span></p>
                    </div>

                    <div className="flex flex-row gap-1 items-center">
                        {/* Health Controller */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="py-0 size-6">
                                    <GiHeartPlus className="text-emerald-600"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Heal</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Damage Controller */}
                        <Input type="number" className="w-16 py-0 h-6"/>
                        <Button variant="ghost" className="py-0 size-6">
                            <GiShatteredHeart className="text-red-600" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}