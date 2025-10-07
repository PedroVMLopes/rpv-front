"use client"

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaUser, FaHouse, FaUsers, FaMapLocationDot, FaUsersViewfinder } from "react-icons/fa6";
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
        <div className="w-full flex justify-center">
            <NavigationMenu viewport={true} className="md:shadow-2xl">
                <NavigationMenuList className="flex flex-row items-start">

                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`p-0 ${navigationMenuTriggerStyle()} ${isActive("/") ? "bg-popover" : ""}`}
                        >
                            <Link href="/"><FaHouse className="p-0" /></Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="font-bold">
                            <FaUsers className="md:hidden" />
                            <p className="hidden md:inline">Characters</p>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid gap-4 z-10">
                                <li className="z-10">
                                    <NavigationMenuLink 
                                        asChild 
                                        className={`${navigationMenuTriggerStyle()} hover:bg-secondary ${isActive("/characters") ? "bg-secondary" : "bg-popover"}`}
                                    >
                                        <Link href="/characters">All Characters</Link>
                                    </NavigationMenuLink>
                                    <div className="h-[1px] w-full bg-muted my-1" />
                                    <div className="flex flex-col gap-0.5">
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

                    <NavigationMenuItem className={`md:hidden p-0`}>
                        <NavigationMenuLink 
                            asChild 
                            className={`p-0 ${navigationMenuTriggerStyle()} ${isActive("/iniciatives") ? "bg-popover" : ""}`}
                        >
                            <Link href="/iniciatives">
                                <FaUsersViewfinder />
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/encounters") ? "bg-popover" : ""}`}
                        >
                            <Link href="/encounters">
                                <FaMapLocationDot className="md:hidden" />
                                <p className="hidden md:inline">Encounters</p>
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`text-orange-300 ${navigationMenuTriggerStyle()} ${isActive("/forge") ? "bg-orange-300 text-black" : ""}`}
                        >
                            <Link className="flex flex-row" href="/forge">
                                <GiAnvilImpact className="md:hidden" />
                                <p className="hidden md:inline">Forge</p>
                            </Link>
                        </NavigationMenuLink>
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
            </NavigationMenu>
        </div>
    )
}