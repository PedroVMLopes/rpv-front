"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown } from "lucide-react"

export default function IniciativeHeader() {
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className={`bg-sidebar-accent w-full rounded flex flex-row p-2`}>
            <div className="">
                Teste
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            <ul>
                <li>test 1</li>
                <li>test 2</li>
                <li>test 3</li>
            </ul>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}