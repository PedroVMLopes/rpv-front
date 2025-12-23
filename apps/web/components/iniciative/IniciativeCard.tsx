"use client"

import { LucideHeart, LucideShield } from "lucide-react";
import { FaPlus, FaMinus, FaChevronRight } from "react-icons/fa6";
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

    let borderColor = ""
    let textColor = ""
    let backgroundColor = ""
    let backgroundColorHover = ""

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

    switch (character.type) {
        case "enemy":
            borderColor = "border-red-900"
            textColor = "text-red-700"
            backgroundColor = "bg-chart-2"
            backgroundColorHover = "hover:bg-chart-2/50"
            break;
        case "player":
            borderColor = "border-cyan-900"
            textColor = "text-chart-1"
            backgroundColor = "bg-chart-1"
            backgroundColorHover = "hover:bg-chart-1/50"
            break;
        case "npc":
            borderColor = "border-yellow-800"
            textColor = "text-chart-3"
            backgroundColor = "bg-chart-3"
            backgroundColorHover = "hover:bg-chart-3/50"
            break;
    }

    return (
        <div className={`flex flex-col bg-card rounded-xl p-2 pt-1.5 border border-stone-800`}>

            {/* Header Info */}
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-1 pl-1.5 items-center">
                    <p className="font-semibold">{character.name}</p>
                </div>
                {/* Expand Info Button */}
                <Link href={`/characters/${character.type}/edit/${character.id}`}>
                    <Button className={`h-6 w-10 text-card-foreground shadow-2xl ${backgroundColor} ${backgroundColorHover}`} ><FaChevronRight className="size-3 opacity-70 z-0"/></Button>
                </Link>
            </div>

            <div className="flex flex-col mt-2">

                {/* Shield */}
                <div className="flex flex-row gap-3">
                    <div className="flex flex-row items-center gap-2 ml-1 font-semibold">
                        <LucideShield className={`size-4 ${textColor}`}/>
                        <p>{character.ac}</p>
                    </div>
                </div>

                {/* Health */}
                <div className="flex flex-row justify-between mt-1">
                    <div className="flex flex-row items-center gap-2 ml-1 font-semibold">
                        <LucideHeart className={`size-4 ${textColor}`}/>
                        <p>{character.hp}<span className="opacity-50"> / {character.maxHp}</span></p>
                    </div>

                    <div className="flex flex-row gap-1 items-center">

                        {/* Damage Controller */}
                        <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                                <Button onClick={handleDamage} variant="ghost" className="py-0 size-6 hover:bg-red-950/30">
                                    <FaMinus className={`text-card-foreground`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Damage</p>
                            </TooltipContent>
                        </Tooltip>

                        <Input 
                            type="number" 
                            className={`w-16 py-0 h-6`}
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
                                    <FaPlus className="text-card-foreground"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Heal</p>
                            </TooltipContent>
                        </Tooltip>
                        
                    </div>
                </div>

                {/* Health Slider */}
                {character.hp ? 
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
                    :""
                }

            </div>
        </div>
    )
}