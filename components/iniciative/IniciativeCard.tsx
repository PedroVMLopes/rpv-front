import { LucideEdit, LucideExpand, LucideHeart } from "lucide-react";
import { Button } from "../ui/button";

export default function IniciativeCard() {
    return (
        <div className="flex flex-col bg-card rounded p-2 border">
            {/* Header Info */}
            <div className="flex flex-row justify-between items-center">
                <p className="font-semibold">Nome</p>
                <div className="flex flex-row gap-2 items-center">
                    <p className="opacity-60">12</p>
                    <Button className="size-6" variant={"secondary"}><LucideExpand /></Button>
                </div>
            </div>

            <div className="flex flex-col mt-1">
                {/* Health */}
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <LucideHeart className="size-4 text-red-800"/>
                        <p>20<span className="opacity-50"> / 20</span></p>
                    </div>
                    <div className="flex flex-row gap-1">
                        <Button className="p-2 leading-0">Heal</Button>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}