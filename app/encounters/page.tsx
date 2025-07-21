import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Encounters() {
    return (
        <div className="flex flex-col mt-2">
            <div className="flex flex-row gap-2">
                <Input placeholder="Encounter Name" />
                <Button>New Encounter</Button>
            </div>

            <p className="font-semibold text-lg my-4">Your Encounters</p>
            <div className="grid grid-cols-3">
                <Card className="">
                    <CardHeader>
                        <p>Encounter Name</p>
                        <CardAction>
                            <Button>x</Button>
                        </CardAction>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}