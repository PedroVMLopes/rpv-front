export default function CharacterCardInfoBlocks() {
    return (
        <>
            {/* Top Info Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                {/* Class & Subclass */}
                <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground">
                    <p className="font-bold text-lg">Human Rogue</p>
                    <p className="text-sm">Circle of the moon</p>
                </div>
                {/* Alignment & Background */}
                <div className="flex flex-col border rounded-2xl p-2 px-3 bg-popover text-popover-foreground">
                    <p className="font-bold text-lg">Heremita</p>
                    <p className="text-sm">Neutral Evil</p>
                </div>
            </div>
            
            {/* Bottom Info Blocks */}
            <div className="flex flex-col gap-2">
                {/* Description */}
                <div className="flex flex-col border rounded-2xl p-2 px-3 gap-1 bg-popover text-popover-foreground">
                    <p className="text-sm opacity-60">Description</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, deserunt?</p>
                </div>
                {/* Objectives */}
                <div className="flex flex-col border rounded-2xl p-2 px-3 gap-1 bg-popover text-popover-foreground">
                    <p className="text-sm opacity-60">Objectives</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, deserunt?</p>
                </div>
            </div>
        </>
    )
}