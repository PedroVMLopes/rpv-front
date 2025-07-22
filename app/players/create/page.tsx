import CharacterForm from "@/components/character/CharacterForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreatePlayer() {
    return (
        <div>
            <Link href={"/players"}>
                <Button className="font-semibold" variant={"destructive"}>Cancel</Button>
            </Link>
            <div className="mt-4 w-full flex flex-col items-center">
                <h1>Create a New Player</h1>
                <CharacterForm />
            </div>
        </div>
    )
}