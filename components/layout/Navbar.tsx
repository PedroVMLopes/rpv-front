"use client"

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export default function Navbar() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-full flex md:justify-center">
            <NavigationMenu viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem className={`md:hidden`}>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/iniciatives") ? "bg-muted text-primary" : ""}`}
                        >
                            <Link href="/iniciatives">Iniciatives</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/tests") ? "bg-muted" : ""}`}
                        >
                            <Link href="/tests">Main</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/encounters") ? "bg-muted" : ""}`}
                        >
                            <Link href="/encounters">Encounters & Events</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/npc") ? "bg-muted" : ""}`}
                        >
                            <Link href="/npc">NPCs</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/enemy") ? "bg-muted" : ""}`}
                        >
                            <Link href="/enemy">Enemies</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink 
                            asChild 
                            className={`${navigationMenuTriggerStyle()} ${isActive("/player") ? "bg-muted" : ""}`}
                        >
                            <Link href="/player">Players</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </ NavigationMenu>
        </div>
    )
}