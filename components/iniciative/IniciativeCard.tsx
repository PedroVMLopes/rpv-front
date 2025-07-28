"use client"

import { LucideChevronRight, LucideHeart, LucideShield } from "lucide-react";
import { GiHeartPlus, GiHeartMinus } from "react-icons/gi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Character, useCharacterStore } from "@/store/useCharacterStore";
import { useState } from "react";
import Link from "next/link";
import { Slider } from "../ui/slider";
import { HealthSlider } from "../ui/HealthSlider";

interface IniciativeCardProps {
    character: Character;
}

export default function IniciativeCard({ character }: IniciativeCardProps) {
    const [ amount, setAmount ] = useState<number>(0);
    const updateHp = useCharacterStore((state) => state.updateHp);

    function handleHeal() {
        if (amount > 0) {
            updateHp(character.id, amount);
            setAmount(0);
        }
    }

    function handleDamage() {
        updateHp(character.id, -amount);
        setAmount(0);
    }

    return (
        <div className="flex flex-col bg-card rounded-lg p-2 pt-1 pr-1 border">

            {/* Header Info */}
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-1 pl-1.5 items-center">
                    <p className="font-semibold">{character.name}</p>
                </div>
                {/* Expand Info Button */}
                <Link href={`/players/edit/${character.id}`}>
                    <Button className="size-6" variant={"default"}><LucideChevronRight className="size-5"/></Button>
                </Link>
            </div>

            <div className="flex flex-col mt-2">

                {/* Shield */}
                <div className="flex flex-row gap-3">
                    <div className="flex flex-row items-center gap-2 ml-1 font-semibold">
                        <LucideShield className="size-4 text-cyan-600"/>
                        <p>{character.ac}</p>
                    </div>
                </div>

                {/* Health */}
                <div className="flex flex-row justify-between mt-1">
                    <div className="flex flex-row items-center gap-2 ml-1 font-semibold">
                        <LucideHeart className="size-4 text-red-600"/>
                        <p>{character.hp}<span className="opacity-50"> / {character.maxHp}</span></p>
                    </div>

                    <div className="flex flex-row gap-1 items-center">
                        {/* Health Controller */}
                        <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                                <Button onClick={handleHeal} variant="ghost" className="py-0 size-6">
                                    <GiHeartPlus className="text-emerald-500"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Heal</p>
                            </TooltipContent>
                        </Tooltip>

                        <Input 
                            type="number" 
                            className="w-16 py-0 h-6"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />

                        {/* Damage Controller */}
                        <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                                <Button onClick={handleDamage} variant="ghost" className="py-0 size-6">
                                    <GiHeartMinus className="text-red-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Damage</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Health Slider */}
                <HealthSlider 
                    className="mt-2 px-1"
                    defaultValue={[20]}
                    max={20}
                    step={1}
                />

            </div>
        </div>
    )
}