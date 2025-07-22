"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LuChevronsUpDown, LuSwords } from "react-icons/lu";
import { LucidePlus, LucidePencil } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function IniciativeHeader() {
    const [position, setPosition] = React.useState("Encouter 1");

    return (
        <DropdownMenu>
            {/* Header Info */}
            <DropdownMenuTrigger asChild className={`bg-muted hover:bg-sidebar-accent w-full rounded-lg flex flex-row p-2`}>
                <div className="flex flex-row items-center">
                    <div className="bg-sidebar-accent text-accent-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <LuSwords className="size-4" />
                    </div>
                    <div className="flex flex-col pl-2 gap-0.5">
                        <span className="font-medium text-sm leading-none">Encouter 1</span>
                        <span className="text-xs">Hard</span>
                    </div>
                    <LuChevronsUpDown className="ml-auto size-4" />
                </div>
            </DropdownMenuTrigger>

            {/* Dropdown Info */}
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width)"
                align="start"
            >
                <DropdownMenuLabel className="text-xs opacity-60 font-medium">Active Encounters</DropdownMenuLabel>
                {/* Encounter Selector */}
                <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                    <DropdownMenuRadioItem value={"Encouter 1"}>Encouter 1</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={"Encouter 2"}>Encouter 2</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={"Encouter 3"}>Encouter 3</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                {/* Create New Players & Enemies */}
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Create Player</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <div className="flex flex-col gap-1">
                                    <Input placeholder="Name"></Input>
                                    <Input placeholder="AC"></Input>
                                    <Input placeholder="HP"></Input>
                                    <Input placeholder="Mod"></Input>
                                    <Button>Add</Button>
                                </div>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Create Enemy</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <div className="flex flex-col gap-1">
                                    <Input placeholder="Name"></Input>
                                    <Input placeholder="AC"></Input>
                                    <Input placeholder="HP"></Input>
                                    <Input placeholder="Mod"></Input>
                                    <Button>Add</Button>
                                </div>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Add & Edit Encounters */}
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                    <div className="flex flex-row gap-2 items-center">
                        <LucidePlus className="ml-auto" />
                        <p className="leading-none">New Encounter</p>
                    </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="mt-1">
                        <div className="flex flex-row gap-2 items-center">
                            <LucidePencil className="ml-auto size-4" />
                            <p className="leading-none">Edit Encounter</p>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                
            </DropdownMenuContent>
        </DropdownMenu>
    )
}