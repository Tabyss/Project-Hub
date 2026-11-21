import { useState } from "react";
import {
  Search,
  Plus,
  Folder,
  SlidersHorizontal,
  ArrowUpRight,
  Sparkles,
  Check,
  X,
  Star,
  Clock,
  ChevronRight,
} from "lucide-react";

export function DsButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "coral" | "secondary" | "ghost";
  size?: "sm" | "md" | "icon";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#141414] text-white hover:bg-neutral-800 shadow-xs",
    coral: "bg-coral text-white hover:bg-coral/90 shadow-xs",
    secondary:
      "bg-surface text-ink border border-line hover:bg-[#EFECE9]",
    ghost: "bg-transparent text-ink-muted hover:bg-shell hover:text-ink",
  };
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-full",
    md: "px-4 py-2 text-xs rounded-full",
    icon: "w-9 h-9 rounded-full p-0",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DsPill({
  label,
  active = false,
  dotColor,
  count,
  onClick,
}: {
  label: string;
  active?: boolean;
  dotColor?: string;
  count?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
        active
          ? "bg-[#141414] text-white shadow-xs"
          : "bg-white text-ink border border-line hover:bg-surface"
      }`}
    >
      {dotColor && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            active ? "bg-white/20 text-white" : "bg-shell text-ink-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function DsBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "coral" | "dark" | "neutral";
}) {
  const styles = {
    coral: "bg-coral text-white",
    dark: "bg-[#141414] text-white",
    neutral: "bg-shell text-ink-muted",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export function DsStatCard({
  label,
  value,
  sublabel,
  variant = "light",
  badgeText,
  onAction,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "light" | "dark" | "coral-outline";
  badgeText?: string;
  onAction?: () => void;
}) {
  const styles = {
    light: "bg-white border border-line text-ink",
    dark: "bg-[#141414] border border-[#141414] text-white",
    "coral-outline": "bg-white border-2 border-[#E13B5A] text-ink",
  };

  return (
    <div
      className={`rounded-[20px] p-4 flex flex-col justify-between transition-all ${styles[variant]}`}
    >
      <div className="flex items-center justify-between text-xs mb-2">
        <span
          className={
            variant === "dark"
              ? "text-neutral-400 font-medium"
              : "text-ink-muted font-medium"
          }
        >
          {label}
        </span>
        {badgeText && <DsBadge tone="coral">{badgeText}</DsBadge>}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {sublabel && (
            <p
              className={`text-[11px] mt-1 ${
                variant === "dark" ? "text-neutral-400" : "text-ink-muted"
              }`}
            >
              {sublabel}
            </p>
          )}
        </div>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
              variant === "dark"
                ? "bg-white text-ink"
                : "bg-shell text-ink"
            }`}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function DsInput({
  icon,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
          {icon}
        </span>
      )}
      <input
        className={`w-full ${
          icon ? "pl-10" : "pl-4"
        } pr-4 py-2 bg-white border border-line rounded-full text-xs text-ink placeholder:text-ink-subtle outline-none focus:border-[#141414] transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}

export default function DesignSystemPage() {
  const [activePill, setActivePill] = useState("All");
  const [toggleState, setToggleState] = useState(true);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DsBadge tone="coral">Design System v1.0</DsBadge>
            <span className="text-xs text-ink-muted">Thabys Workspace UI</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            Design System & Tokens
          </h1>
          <p className="text-xs text-ink-muted mt-1.5 max-w-xl">
            Fondasi komponen terpadu dengan shell Warm Stone (#F3F2F0), kanvas putih rounded-[28px], aksen Crimson Coral (#E13B5A), dan kontras kartu Obsidian (#141414).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DsButton variant="secondary" onClick={() => setIsSampleModalOpen(true)}>
            Preview Modal
          </DsButton>
          <DsButton variant="coral">
            <Plus size={15} /> Primary Action
          </DsButton>
        </div>
      </div>

      {/* 1. Color Tokens */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-ink">01. Color Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: "Shell Base", hex: "#F3F2F0", text: "text-ink" },
            { name: "Canvas White", hex: "#FFFFFF", text: "text-ink" },
            { name: "Surface Bento", hex: "#F8F8F7", text: "text-ink" },
            { name: "Obsidian Ink", hex: "#141414", text: "text-white" },
            { name: "Crimson Coral", hex: "#E13B5A", text: "text-white" },
            { name: "Soft Coral Tint", hex: "#FCEBEF", text: "text-[#E13B5A]" },
          ].map((c) => (
            <div
              key={c.name}
              className="rounded-[20px] p-4 border border-line flex flex-col justify-between h-24"
              style={{ backgroundColor: c.hex }}
            >
              <span className={`text-xs font-bold ${c.text}`}>{c.name}</span>
              <span className={`text-[11px] font-mono opacity-80 ${c.text}`}>
                {c.hex}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Metric Cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-ink">02. Metric & Highlight Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DsStatCard label="Total Projects" value="24" sublabel="18 Public • 6 Private" onAction={() => {}} />
          <DsStatCard label="Active Mode" value="DevDocs" sublabel="Workspace Terisolasi" variant="dark" onAction={() => {}} />
          <DsStatCard label="Saved Bookmarks" value="142" badgeText="+12 baru" variant="coral-outline" />
          <DsStatCard label="Notes & Folders" value="64" sublabel="Tersinkronisasi otomatis" />
        </div>
      </section>

      {/* 3. Controls & Pills */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-[24px] p-5 border border-line space-y-4">
          <h2 className="text-sm font-bold text-ink">03. Buttons & Filter Pills</h2>
          <div className="flex flex-wrap items-center gap-2">
            <DsButton variant="primary">Details / Primary</DsButton>
            <DsButton variant="coral"><Plus size={14} /> Create New</DsButton>
            <DsButton variant="secondary"><SlidersHorizontal size={13} /> Filters</DsButton>
            <DsButton variant="coral" size="icon"><Plus size={16} /></DsButton>
            <DsButton variant="secondary" size="icon"><ArrowUpRight size={15} /></DsButton>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
            {["All", "Frontend", "AI & Data", "Reading"].map((item) => (
              <DsPill
                key={item}
                label={item}
                active={activePill === item}
                dotColor={item === "AI & Data" ? "#E13B5A" : undefined}
                count={item === "All" ? 12 : 4}
                onClick={() => setActivePill(item)}
              />
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-[24px] p-5 border border-line space-y-4">
          <h2 className="text-sm font-bold text-ink">04. Search Input & Toggle</h2>
          <DsInput icon={<Search size={14} />} placeholder='Try searching "insights"' />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setToggleState(!toggleState)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  toggleState ? "bg-[#141414]" : "bg-[#D6D5D2]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    toggleState ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-ink">
                {toggleState ? "DevDocs Mode" : "Portfolio Mode"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <DsBadge tone="coral"><Sparkles size={11} /> Top Pick</DsBadge>
              <DsBadge tone="dark"><Star size={11} /> Featured</DsBadge>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bento Surfaces */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-[24px] p-5 border border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center text-[#E13B5A]">
              <Folder size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">Workspace Bento Card</h4>
              <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                <Clock size={11} /> Updated just now
              </p>
            </div>
          </div>
          <DsButton variant="primary" size="sm">Open</DsButton>
        </div>

        <div
          className="rounded-[24px] p-5 border border-[#F5D0D8] flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FCEBEF 100%)" }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E13B5A]">
              Highlight Surface
            </span>
            <h4 className="text-lg font-bold text-ink mt-0.5">
              Soft Rose-Coral Gradient
            </h4>
            <p className="text-xs text-ink-muted">
              Digunakan untuk area prioritas dan ringkasan progres.
            </p>
          </div>
          <DsButton variant="coral" size="icon"><Check size={16} /></DsButton>
        </div>
      </section>

      {isSampleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 border border-line shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Design System Modal</h3>
              <button
                onClick={() => setIsSampleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-shell flex items-center justify-center text-ink"
              >
                <X size={15} />
              </button>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Seluruh modal menggunakan radius 28px dan tombol pill Obsidian / Crimson Coral.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <DsButton variant="secondary" onClick={() => setIsSampleModalOpen(false)}>Tutup</DsButton>
              <DsButton variant="coral" onClick={() => setIsSampleModalOpen(false)}>Terapkan</DsButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}