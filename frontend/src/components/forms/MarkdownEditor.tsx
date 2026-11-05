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
} from "lucide-react";

interface MarkdownEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

export default function MarkdownEditor({
    label,
    value,
    onChange,
    placeholder,
    rows = 6,
}: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const applyFormat = (before: string, after: string = "") => {
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

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                start + before.length + selectedText.length,
            );
        }, 0);
    };

    return (
        <div className="flex flex-col">
            <label className="block text-sm font-semibold mb-2 text-slate-800">
                {label}
            </label>
            <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 bg-slate-50 border-b border-slate-200 px-2 py-1.5">
                    {/* Headings */}
                    <button
                        type="button"
                        onClick={() => applyFormat("# ", "")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Heading 1 (#)"
                    >
                        <Heading1 size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("## ", "")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Heading 2 (##)"
                    >
                        <Heading2 size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("### ", "")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Heading 3 (###)"
                    >
                        <Heading3 size={16} strokeWidth={2.5} />
                    </button>

                    <div className="w-px h-4 bg-slate-300 mx-1" />

                    {/* Text Styles */}
                    <button
                        type="button"
                        onClick={() => applyFormat("**", "**")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Bold (**text**)"
                    >
                        <Bold size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("*", "*")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Italic (*text*)"
                    >
                        <Italic size={16} strokeWidth={2.5} />
                    </button>

                    <div className="w-px h-4 bg-slate-300 mx-1" />

                    {/* Lists */}
                    <button
                        type="button"
                        onClick={() => applyFormat("- ", "")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Bullet List (- )"
                    >
                        <List size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("1. ", "")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Numbered List (1. )"
                    >
                        <ListOrdered size={16} strokeWidth={2.5} />
                    </button>

                    <div className="w-px h-4 bg-slate-300 mx-1" />

                    {/* Formatting Extra */}
                    <button
                        type="button"
                        onClick={() => applyFormat("> ", "")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Quote (> )"
                    >
                        <Quote size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("`", "`")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Inline Code (`code`)"
                    >
                        <Code size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("\n---\n", "")}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 hover:text-blue-600 rounded transition-colors"
                        title="Horizontal Rule (---)"
                    >
                        <Minus size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 outline-none resize-y bg-white text-slate-800 text-base leading-relaxed placeholder:text-slate-400 font-mono"
                />
            </div>
        </div>
    );
}
