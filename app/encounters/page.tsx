import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Encounters() {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-2">
                <Input placeholder="Encounter Name" />
                <Button>New Encounter</Button>
            </div>
        </div>
    )
}