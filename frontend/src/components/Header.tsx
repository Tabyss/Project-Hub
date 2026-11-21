import { useState, useRef, useEffect } from "react";
import Logo from "../assets/logo Thabys.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    APP_MODULES,
    PRIMARY_NAV_LIMIT,
    getActiveModule,
    type ModuleConfig,
} from "../config/modules";
import { useWorkspaceStore } from "../store/workspaceStore";
import SecondarySidebar from "./SecondarySidebar";
import {
    LogOut,
    LogIn,
    Plus,
    ChevronDown,
    MoreHorizontal,
    X,
} from "lucide-react";

const Header = ({ children }: { children?: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin, openLoginModal, logout } =
        useAuth();
    const workspaceState = useWorkspaceStore();
    const { triggerQuickModal, setMobileDrawerOpen } = workspaceState;

    const [isDesktopMoreOpen, setIsDesktopMoreOpen] = useState(false);
    const [isMobileAllMenuOpen, setIsMobileAllMenuOpen] = useState(false);
    const desktopDropdownRef = useRef<HTMLDivElement>(null);

    const primaryItems = APP_MODULES.slice(0, PRIMARY_NAV_LIMIT);
    const overflowItems = APP_MODULES.slice(PRIMARY_NAV_LIMIT);
    const activeModule = getActiveModule(location.pathname);

    const isModuleActive = (mod: ModuleConfig) => activeModule?.id === mod.id;

    const sidebarConfig = activeModule?.sidebar;
    const MobileDrawerIcon = sidebarConfig?.mobileButtonIcon;
    const hasActiveFilter =
        sidebarConfig?.hasActiveFilter?.(workspaceState) ?? false;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                desktopDropdownRef.current &&
                !desktopDropdownRef.current.contains(e.target as Node)
            ) {
                setIsDesktopMoreOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileAllMenuOpen(false);
    }, [location.pathname]);

    const handleShortcutClick = (e: React.MouseEvent, item: ModuleConfig) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            openLoginModal();
            return;
        }

        if (!item.shortcut) return;

        if (item.shortcut.actionType === "route") {
            navigate(item.shortcut.target);
        } else {
            if (!isModuleActive(item)) {
                navigate(item.path);
            }
            triggerQuickModal(item.shortcut.target as any);
        }
        setIsDesktopMoreOpen(false);
        setIsMobileAllMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-shell text-ink flex flex-col">
            {/* ==================== TOP BAR ==================== */}
            <header className="h-16 px-4 md:px-6 flex items-center justify-between gap-2 shrink-0">
                {/* Left: Brand & Dynamic Mobile Drawer Trigger */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <Link
                        to="/"
                        className="w-9 h-9 rounded-full bg-ink flex items-center justify-center p-2 shrink-0 shadow-xs"
                    >
                        <img
                            src={Logo}
                            alt="Thabys"
                            className="w-full h-full object-contain invert brightness-200"
                        />
                    </Link>

                    <Link
                        to="/"
                        className="flex items-center gap-1 text-sm font-bold text-ink truncate"
                    >
                        <span className="truncate">
                            {user ? `${user.username}.hub` : "Thabys.hub"}
                        </span>
                    </Link>

                    {/* Otomatis render tombol drawer mobile jika modul aktif punya sidebar */}
                    {sidebarConfig && MobileDrawerIcon && (
                        <button
                            type="button"
                            onClick={() => setMobileDrawerOpen(true)}
                            className="lg:hidden relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas border border-line text-xs font-semibold text-ink hover:bg-surface transition-colors cursor-pointer ml-1"
                        >
                            <MobileDrawerIcon
                                size={13}
                                className="text-coral"
                            />
                            <span>{sidebarConfig.mobileButtonLabel}</span>
                            {hasActiveFilter && (
                                <span className="w-2 h-2 rounded-full bg-coral" />
                            )}
                        </button>
                    )}
                </div>

                {/* Center (Desktop): Max 3 Menu Pills + Hover Shortcut + Dropdown */}
                <nav className="hidden md:flex items-center gap-1.5 bg-canvas/85 backdrop-blur-xs p-1.5 rounded-full border border-line/80 shadow-2xs">
                    {primaryItems.map((item) => {
                        const Icon = item.icon;
                        const active = isModuleActive(item);

                        return (
                            <div key={item.id} className="relative group">
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        active
                                            ? "bg-ink text-canvas shadow-xs"
                                            : "text-ink-muted hover:text-ink hover:bg-surface"
                                    }`}
                                >
                                    <Icon size={14} />
                                    {active && <span>{item.label}</span>}
                                </Link>

                                {item.shortcut && (
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                                        <button
                                            type="button"
                                            onClick={(e) =>
                                                handleShortcutClick(e, item)
                                            }
                                            className="flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full bg-ink text-canvas hover:bg-coral text-[11px] font-semibold shadow-lg border border-line/20 transition-colors cursor-pointer"
                                        >
                                            <Plus size={13} />
                                            <span>{item.shortcut.label}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {overflowItems.length > 0 && (
                        <div className="relative" ref={desktopDropdownRef}>
                            <button
                                type="button"
                                onClick={() =>
                                    setIsDesktopMoreOpen((prev) => !prev)
                                }
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                    isDesktopMoreOpen ||
                                    overflowItems.some((item) =>
                                        isModuleActive(item),
                                    )
                                        ? "bg-coral-soft text-coral"
                                        : "text-ink-muted hover:text-ink hover:bg-surface"
                                }`}
                                title="Semua Menu"
                            >
                                <MoreHorizontal size={15} />
                                <ChevronDown
                                    size={12}
                                    className={`transition-transform ${
                                        isDesktopMoreOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {isDesktopMoreOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-canvas rounded-2xl p-2 border border-line shadow-xl z-50 space-y-1">
                                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                                        All Modules
                                    </div>
                                    {APP_MODULES.map((item) => {
                                        const Icon = item.icon;
                                        const active = isModuleActive(item);
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between gap-1 rounded-xl hover:bg-surface px-2.5 py-1.5 transition-colors"
                                            >
                                                <Link
                                                    to={item.path}
                                                    onClick={() =>
                                                        setIsDesktopMoreOpen(
                                                            false,
                                                        )
                                                    }
                                                    className={`flex items-center gap-2 text-xs font-medium flex-1 ${
                                                        active
                                                            ? "text-coral font-bold"
                                                            : "text-ink"
                                                    }`}
                                                >
                                                    <Icon size={14} />
                                                    <span>{item.label}</span>
                                                </Link>

                                                {item.shortcut && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleShortcutClick(
                                                                e,
                                                                item,
                                                            )
                                                        }
                                                        title={
                                                            item.shortcut.label
                                                        }
                                                        className="w-6 h-6 rounded-full bg-shell hover:bg-coral hover:text-canvas text-ink flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Right: User Profile & Auth */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {isAuthenticated && user ? (
                        <>
                            <div className="flex items-center gap-2 bg-canvas border border-line pl-1.5 pr-2.5 py-1 rounded-full">
                                <div className="w-6 h-6 rounded-full bg-ink text-canvas text-[11px] font-bold flex items-center justify-center uppercase">
                                    {user.username.slice(0, 2)}
                                </div>
                                <span className="hidden sm:inline text-xs font-semibold text-ink">
                                    {user.username}
                                </span>
                                {isAdmin && (
                                    <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-bold bg-coral-soft text-coral rounded-full">
                                        Admin
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={logout}
                                title="Logout"
                                className="w-9 h-9 rounded-full bg-canvas border border-line text-ink-muted hover:text-coral flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <LogOut size={15} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={openLoginModal}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-ink text-canvas text-xs font-semibold rounded-full hover:bg-ink/90 transition-colors cursor-pointer"
                        >
                            <LogIn size={14} />
                            <span>Masuk</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex px-3 pb-4 md:px-6 md:pb-6 gap-4 overflow-hidden">
                <SecondarySidebar />

                <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-canvas/95 backdrop-blur-md p-1.5 rounded-full border border-line shadow-xl max-w-[94vw]">
                    {primaryItems.map((item) => {
                        const Icon = item.icon;
                        const active = isModuleActive(item);
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                                    active
                                        ? "bg-ink text-canvas"
                                        : "text-ink-muted hover:text-ink"
                                }`}
                            >
                                <Icon size={14} />
                                {active && <span>{item.label}</span>}
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => setIsMobileAllMenuOpen((prev) => !prev)}
                        className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                            isMobileAllMenuOpen ||
                            overflowItems.some((item) => isModuleActive(item))
                                ? "bg-coral text-canvas"
                                : "bg-surface text-ink"
                        }`}
                        aria-label="Semua Menu"
                    >
                        <MoreHorizontal size={15} />
                        <span>Menu</span>
                    </button>
                </nav>

                {/* MOBILE ALL MENU SHEET */}
                {isMobileAllMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center p-3">
                        <div
                            onClick={() => setIsMobileAllMenuOpen(false)}
                            className="fixed inset-0 bg-ink/40 backdrop-blur-xs"
                        />

                        <div className="relative w-full max-w-md bg-canvas rounded-[28px] border border-line p-5 shadow-2xl z-10 mb-14 space-y-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-line">
                                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                                    All Modules & Quick Actions
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsMobileAllMenuOpen(false)
                                    }
                                    className="w-7 h-7 rounded-full bg-shell text-ink flex items-center justify-center"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                {APP_MODULES.map((item) => {
                                    const Icon = item.icon;
                                    const active = isModuleActive(item);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-surface/60"
                                        >
                                            <Link
                                                to={item.path}
                                                onClick={() =>
                                                    setIsMobileAllMenuOpen(
                                                        false,
                                                    )
                                                }
                                                className={`flex items-center gap-2.5 text-xs font-semibold flex-1 px-2 py-1 ${
                                                    active
                                                        ? "text-coral"
                                                        : "text-ink"
                                                }`}
                                            >
                                                <Icon size={15} />
                                                <span>{item.label}</span>
                                            </Link>

                                            {item.shortcut && (
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleShortcutClick(
                                                            e,
                                                            item,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-ink text-canvas hover:bg-coral text-[11px] font-semibold transition-colors cursor-pointer"
                                                >
                                                    <Plus size={12} />
                                                    <span>
                                                        {item.shortcut.label}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN WHITE ROUNDED CANVAS */}
                <main className="flex-1 bg-canvas rounded-[28px] border border-line/70 shadow-xs p-5 pb-24 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Header;
