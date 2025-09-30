"use client"

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaUser, FaHouse } from "react-icons/fa6";
import { GiAnvilImpact } from "react-icons/gi";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export default function Navbar() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-full flex md:justify-center">
            <NavigationMenu viewport={false} className="shadow-2xl">
                <NavigationMenuList>

                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/") ? "bg-muted" : ""}`}
                        >
                            <Link href="/"><FaHouse /></Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    
                    <NavigationMenuItem>
                        <div className="h-6 w-[1px] bg-muted"></div>
                    </NavigationMenuItem>

                    <NavigationMenuItem className={`md:hidden`}>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/iniciatives") ? "bg-muted" : ""}`}
                        >
                            <Link href="/iniciatives">Iniciatives</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/encounters") ? "bg-muted" : ""}`}
                        >
                            <Link href="/encounters">Encounters</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="font-bold">Characters</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid gap-4">
                                <li className="z-10">
                                    <NavigationMenuLink 
                                        asChild 
                                        className={`${navigationMenuTriggerStyle()} hover:bg-secondary ${isActive("/characters") ? "bg-secondary" : "bg-popover"}`}
                                    >
                                        <Link href="/characters">All Characters</Link>
                                    </NavigationMenuLink>
                                    <div className="h-[1px] w-full bg-muted my-1" />
                                    <div className="flex flex-col gap-1">
                                        <NavigationMenuLink 
                                            asChild 
                                            className={`${navigationMenuTriggerStyle()} hover:bg-chart-1 ${isActive("/characters/player") ? "bg-chart-1" : "bg-popover"}`}
                                        >
                                            <Link href="/characters/player">Players</Link>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink 
                                            asChild 
                                            className={`${navigationMenuTriggerStyle()} hover:bg-chart-2 ${isActive("/characters/enemy") ? "bg-char-2" : "bg-popover"}`}
                                        >
                                            <Link href="/characters/enemy">Enemies</Link>
                                        </NavigationMenuLink>
                                        <NavigationMenuLink 
                                            asChild 
                                            className={`${navigationMenuTriggerStyle()} hover:bg-chart-3 hover:text-foreground ${isActive("/characters/npc") ? "bg-char-3" : "bg-popover"}`}
                                        >
                                            <Link href="/characters/npc">NPC's</Link>
                                        </NavigationMenuLink>
                                    </div>
                                </li>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`text-orange-300 ${navigationMenuTriggerStyle()} ${isActive("/forge") ? "bg-orange-300 text-black" : ""}`}
                        >
                            <Link className="flex flex-row" href="/forge"><GiAnvilImpact />Forge</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <div className="h-6 w-[1px] bg-muted"></div>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/") ? "bg-muted" : ""}`}
                        >
                            <Link href="/"><FaUser className="size-4 text-amber-100" /></Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                </NavigationMenuList>
            </ NavigationMenu>
        </div>
    )
}