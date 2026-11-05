import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface HeadingItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({
    contentDependency,
}: {
    contentDependency: string;
}) {
    const [headings, setHeadings] = useState<HeadingItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const timer = setTimeout(() => {
            const articleContainer = document.querySelector(
                ".prose-content-area",
            );
            if (!articleContainer) return;

            const headingElements = Array.from(
                articleContainer.querySelectorAll("h1, h2, h3"),
            ) as HTMLElement[];

            const filteredElements = headingElements.filter((el) => {
                return (
                    !el.closest(".roadmap-section") &&
                    !el.closest(".changelog-section")
                );
            });

            const parsedHeadings: HeadingItem[] = filteredElements.map(
                (heading) => ({
                    id: heading.id,
                    text: heading.innerText,
                    level: Number(heading.tagName.replace("H", "")),
                }),
            );

            setHeadings(parsedHeadings);
        }, 100);

        return () => clearTimeout(timer);
    }, [contentDependency]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-80px 0px -60% 0px" },
        );

        const articleContainer = document.querySelector(".prose-content-area");
        if (articleContainer) {
            const headingElements =
                articleContainer.querySelectorAll("h1, h2, h3");
            headingElements.forEach((el) => observer.observe(el));
        }

        return () => observer.disconnect();
    }, [headings]);

    const scrollToHeading = (id: string) => {
        const targetElement = document.getElementById(id);
        if (targetElement) {
            const yOffset = -100;
            const y =
                targetElement.getBoundingClientRect().top +
                window.pageYOffset +
                yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    if (headings.length === 0) return null;

    return (
        <aside className="hidden xl:block w-64 flex-shrink-0 self-start sticky top-28">
            <div className="p-4 bg-white/80 backdrop-blur border border-slate-200/80 rounded-xl shadow-sm space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm">
                    <List size={16} className="text-blue-600" />
                    <span>Daftar Isi</span>
                </div>
                <nav className="space-y-1 text-sm">
                    {headings.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToHeading(item.id)}
                            className={`block w-full text-left transition-colors truncate py-1 px-2 rounded-md ${
                                item.level === 3
                                    ? "pl-5 text-xs"
                                    : item.level === 2
                                      ? "pl-3 text-sm"
                                      : "font-semibold text-sm"
                            } ${
                                activeId === item.id
                                    ? "bg-blue-50 text-blue-600 font-bold"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
