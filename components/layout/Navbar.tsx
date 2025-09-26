"use client"

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaUser, FaHouse } from "react-icons/fa6";
import { GiAnvilImpact } from "react-icons/gi";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator";

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
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/characters") ? "bg-muted" : ""}`}
                        >
                            <Link href="/characters">Characters</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`text-orange-300 ${navigationMenuTriggerStyle()} ${isActive("/") ? "bg-orange-300 text-black" : ""}`}
                        >
                            <Link className="flex flex-row" href="/"><GiAnvilImpact />Forge</Link>
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