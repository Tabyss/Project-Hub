import Logo from "../assets/logo Thabys.svg";
import { Link, useLocation } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
    { id: "project", label: "Project", path: "/" },
    { id: "note", label: "Notes", path: "/notes" },
    { id: "daily", label: "Daily", path: "/daily" },
];

const Header = () => {
    const location = useLocation();
    const { isAuthenticated, openLoginModal, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
            <div className="mx-4 md:mx-7 h-16 flex items-center justify-between gap-4">
                {/* Logo (Kiri) */}
                <Link
                    to="/"
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                >
                    <img
                        src={Logo}
                        alt="Thabys Logo"
                        className="w-full h-full object-contain"
                    />
                </Link>

                {/* Navigasi (Tengah) */}
                <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-full">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            item.path === "/"
                                ? location.pathname === "/"
                                : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-black text-white shadow-sm"
                                        : "text-gray-600 hover:text-black hover:bg-gray-200/60"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center shrink-0">
                    {isAuthenticated ? (
                        <button
                            onClick={logout}
                            className="w-10 h-10 flex justify-center items-center gap-1.5 rounded-full text-xs md:text-sm font-medium text-red-100 bg-red-700 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={openLoginModal}
                            className="w-10 h-10 flex justify-center items-center gap-1.5 rounded-full text-xs md:text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <LogIn size={16} />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
