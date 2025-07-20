import Navbar from "./Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <Navbar />
            {children}
        </div>
    )
}