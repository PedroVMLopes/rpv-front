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
import { HealthSlider } from "../ui/HealthSlider";

interface IniciativeCardProps {
    character: Character;
}

export default function IniciativeCard({ character }: IniciativeCardProps) {
    const [ amount, setAmount ] = useState<number | undefined>();
    const updateHp = useCharacterStore((state) => state.updateHp);

    function handleHeal() {
        if (amount && amount > 0) {
            updateHp(character.id, amount);
            setAmount(undefined);
        }
    }

    function handleDamage() {
        if (amount) {
            updateHp(character.id, -amount);
            setAmount(undefined);
        }
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
                        <LucideHeart className="size-4 text-emerald-600"/>
                        <p>{character.hp}<span className="opacity-50"> / {character.maxHp}</span></p>
                    </div>

                    <div className="flex flex-row gap-1 items-center">

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

                        <Input 
                            type="number" 
                            className="w-16 py-0 h-6"
                            value={amount ?? ''}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setAmount(newValue === '' ? undefined : Number(newValue));
                            }}
                        />

                        {/* Health Controller */}
                        <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                                <Button onClick={handleHeal} variant="ghost" className="py-0 size-6">
                                    <GiHeartPlus className="text-emerald-600"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Heal</p>
                            </TooltipContent>
                        </Tooltip>
                        
                    </div>
                </div>

                {/* Health Slider */}
                <HealthSlider 
                    className="mt-2 px-1"
                    defaultValue={[character.hp || 0]}
                    max={character.maxHp}
                    step={1}
                    value={[character.hp]}
                    onValueChange={(value) => {
                        // Transforms the slider value into an increment(+) or decrement(-) to be handled by the updateHp()
                        const newValue = value[0];
                        const diff = character.hp !== undefined ? newValue - character.hp : 0;
                        if (diff !== 0) {
                            updateHp(character.id, diff);
                        }
                    }}
                />

            </div>
        </div>
    )
}