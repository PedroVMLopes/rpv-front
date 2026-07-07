import Navbar from "./Navbar";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
                <Navbar />
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
            </div>
            {children}
        </div>
    )
}