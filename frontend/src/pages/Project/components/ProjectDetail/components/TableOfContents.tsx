import { useEffect, useMemo, useState } from "react";
import { List } from "lucide-react";
import { slugify } from "./MarkdownRenderer";

interface HeadingItem {
    id: string;
    text: string;
    level: number;
}

function extractHeadings(markdown: string): HeadingItem[] {
    // Hapus code block agar komentar `#` di dalam code tidak ikut terdeteksi sebagai heading
    const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, "");
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: HeadingItem[] = [];

    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(withoutCodeBlocks)) !== null) {
        const level = match[1].length;
        const rawText = match[2].replace(/[*_`~]/g, "").trim();
        if (rawText) {
            items.push({
                id: slugify(rawText),
                text: rawText,
                level,
            });
        }
    }

    return items;
}

export default function TableOfContents({ content }: { content: string }) {
    const headings = useMemo(() => extractHeadings(content), [content]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                if (visible) {
                    setActiveId(visible.target.id);
                }
            },
            { rootMargin: "-80px 0px -65% 0px" },
        );

        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    const scrollToHeading = (id: string) => {
        const target = document.getElementById(id);
        if (!target) return;

        const y = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
    };

    if (headings.length === 0) return null;

    return (
        <aside className="hidden xl:block w-64 shrink-0 self-start sticky top-28">
            <div className="p-4 bg-surface/90 backdrop-blur border border-line rounded-2xl space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex items-center gap-2 font-bold text-ink border-b border-line pb-2.5 text-xs uppercase tracking-wider">
                    <List size={15} className="text-coral" />
                    <span>Daftar Isi</span>
                </div>

                <nav className="space-y-1">
                    {headings.map((item, idx) => (
                        <button
                            key={`${item.id}-${idx}`}
                            type="button"
                            onClick={() => scrollToHeading(item.id)}
                            className={`block w-full text-left transition-colors truncate py-1.5 px-2.5 rounded-lg cursor-pointer ${
                                item.level === 3
                                    ? "pl-6 text-xs"
                                    : item.level === 2
                                      ? "pl-4 text-xs"
                                      : "font-semibold text-xs"
                            } ${
                                activeId === item.id
                                    ? "bg-coral/10 text-coral font-bold"
                                    : "text-ink-muted hover:text-ink hover:bg-canvas"
                            }`}
                        >
                            {item.text}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
