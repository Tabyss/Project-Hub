import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { getActiveModule } from "../config/modules";
import { useWorkspaceStore } from "../store/workspaceStore";

export default function SecondarySidebar() {
    const location = useLocation();
    const { isMobileDrawerOpen, setMobileDrawerOpen } = useWorkspaceStore();

    const activeModule = getActiveModule(location.pathname);
    const sidebarConfig = activeModule?.sidebar;

    useEffect(() => {
        setMobileDrawerOpen(false);
    }, [location.pathname, setMobileDrawerOpen]);

    // Jika modul aktif tidak mendefinisikan sidebar (misal Design System), sembunyikan otomatis
    if (!sidebarConfig) return null;

    const SidebarPanel = sidebarConfig.component;

    return (
        <>
            {/* 1. DESKTOP STATIC SECONDARY SIDEBAR */}
            <aside className="hidden lg:flex flex-col justify-between w-56 py-2 px-1.5 shrink-0 text-xs select-none">
                <div className="overflow-y-auto scrollbar-none">
                    <SidebarPanel />
                </div>
                <div className="px-2 pt-3 border-t border-line text-[11px] text-ink-muted">
                    <span>Thabys Workspace • 2026</span>
                </div>
            </aside>

            {/* 2. MOBILE SLIDE-OVER DRAWER */}
            {isMobileDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        onClick={() => setMobileDrawerOpen(false)}
                        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
                    />

                    <aside className="relative w-72 max-w-[82vw] h-full bg-canvas border-r border-line shadow-2xl p-5 flex flex-col z-10 text-xs select-none">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
                            <span className="text-sm font-bold text-ink">
                                {sidebarConfig.title}
                            </span>
                            <button
                                type="button"
                                onClick={() => setMobileDrawerOpen(false)}
                                className="w-8 h-8 rounded-full bg-shell text-ink flex items-center justify-center hover:bg-surface-hover cursor-pointer"
                                aria-label="Tutup Drawer"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <SidebarPanel
                                onSelectComplete={() =>
                                    setMobileDrawerOpen(false)
                                }
                            />
                        </div>

                        <div className="px-2 pt-3 border-t border-line text-[11px] text-ink-muted">
                            <span>Thabys Workspace • 2026</span>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
