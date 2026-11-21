import { useRef } from "react";
import {
    Heading1,
    Heading2,
    Heading3,
    Bold,
    Italic,
    List,
    ListOrdered,
    Code,
    Quote,
    Minus,
    type LucideIcon,
} from "lucide-react";

interface MarkdownEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

type ToolbarItem =
    | { type: "divider" }
    | {
          type: "action";
          icon: LucideIcon;
          title: string;
          before: string;
          after?: string;
      };

const TOOLBAR_ITEMS: ToolbarItem[] = [
    { type: "action", icon: Heading1, title: "Heading 1 (#)", before: "# " },
    { type: "action", icon: Heading2, title: "Heading 2 (##)", before: "## " },
    {
        type: "action",
        icon: Heading3,
        title: "Heading 3 (###)",
        before: "### ",
    },
    { type: "divider" },
    {
        type: "action",
        icon: Bold,
        title: "Bold (**text**)",
        before: "**",
        after: "**",
    },
    {
        type: "action",
        icon: Italic,
        title: "Italic (*text*)",
        before: "*",
        after: "*",
    },
    { type: "divider" },
    { type: "action", icon: List, title: "Bullet List (- )", before: "- " },
    {
        type: "action",
        icon: ListOrdered,
        title: "Numbered List (1. )",
        before: "1. ",
    },
    { type: "divider" },
    { type: "action", icon: Quote, title: "Quote (> )", before: "> " },
    {
        type: "action",
        icon: Code,
        title: "Inline Code (`code`)",
        before: "`",
        after: "`",
    },
    {
        type: "action",
        icon: Minus,
        title: "Horizontal Rule (---)",
        before: "\n---\n",
    },
];

export default function MarkdownEditor({
    label,
    value,
    onChange,
    placeholder,
    rows = 6,
}: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const applyFormat = (before: string, after = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = value || "";
        const selectedText = currentText.substring(start, end);

        const newText =
            currentText.substring(0, start) +
            before +
            selectedText +
            after +
            currentText.substring(end);

        onChange(newText);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                start + before.length + selectedText.length,
            );
        });
    };

    return (
        <div className="flex flex-col">
            <label className="block text-xs font-semibold mb-2 text-ink">
                {label}
            </label>
            <div className="border border-line rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-coral/30 focus-within:border-coral transition-all">
                <div className="flex flex-wrap items-center gap-1 bg-canvas border-b border-line px-2 py-1.5">
                    {TOOLBAR_ITEMS.map((item, idx) => {
                        if (item.type === "divider") {
                            return (
                                <div
                                    key={idx}
                                    className="w-px h-4 bg-line mx-1"
                                />
                            );
                        }
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                    applyFormat(item.before, item.after)
                                }
                                className="p-1.5 text-ink-muted hover:bg-surface hover:text-coral rounded-lg transition-colors cursor-pointer"
                                title={item.title}
                            >
                                <Icon size={15} strokeWidth={2.5} />
                            </button>
                        );
                    })}
                </div>

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 outline-none resize-y bg-canvas text-ink text-sm leading-relaxed placeholder:text-ink-muted font-mono"
                />
            </div>
        </div>
    );
}
