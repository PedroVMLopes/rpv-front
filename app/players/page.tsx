import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Players() {
    return (
        <div className="flex flex-col">
            <p>Players Page</p>
            <Link href={"/players/create"}>
                <Button>Create New Player</Button>
            </Link>
        </div>

    )
}