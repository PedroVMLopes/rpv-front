import IniciativeCard from "./IniciativeCard";
import IniciativeHeader from "./IniciativeHeader";

export default function Iniciative() {
    return (
        <div className="">
            <IniciativeHeader />
            <div className="mt-4 gap-2">
                <IniciativeCard />
            </div>
        </div>
    )
}