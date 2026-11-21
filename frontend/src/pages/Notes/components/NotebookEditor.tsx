import React, { useRef, useEffect, useState, useCallback } from "react";
import { Loader2, Image as ImageIcon, Save, Check } from "lucide-react";

interface NotebookEditorProps {
    initialTitle?: string;
    initialContent?: string;
    onSave: (title: string, content: string) => Promise<void>;
    placeholder?: string;
    draftKey?: string;
}

export default function NotebookEditor({
    initialTitle = "",
    initialContent = "",
    onSave,
    placeholder = "Write a note... (Use __underline__, **bold**, *italic*, # Header, - list)",
    draftKey = "notebook_draft_new",
}: NotebookEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const editorRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDraftSaved, setIsDraftSaved] = useState(false);

    const saveCaretPosition = (context: HTMLElement) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        if (!context.contains(selection.anchorNode)) return null;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(context);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    };

    const restoreCaretPosition = (
        context: HTMLElement,
        chars: number | null,
    ) => {
        if (chars === null) return;
        const selection = window.getSelection();
        if (!selection) return;

        const createRange = (
            node: Node,
            charsState: { count: number },
        ): Range | null => {
            if (charsState.count === 0) {
                const range = document.createRange();
                range.setStart(node, 0);
                range.setEnd(node, 0);
                return range;
            }
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent!.length >= charsState.count) {
                    const range = document.createRange();
                    range.setStart(node, charsState.count);
                    range.setEnd(node, charsState.count);
                    charsState.count = 0;
                    return range;
                } else {
                    charsState.count -= node.textContent!.length;
                }
            } else {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const range = createRange(node.childNodes[i], charsState);
                    if (charsState.count === 0) return range;
                }
            }
            return null;
        };

        const range = createRange(context, { count: chars });
        if (range) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    const parseMarkdownHighlight = (rawText: string) => {
        let html = rawText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Inline Styles (Bold, Italic, Underline)
        html = html.replace(
            /\*\*([^\n]+?)\*\*/g,
            '<strong class="font-bold text-slate-900"><span class="text-slate-400 font-normal opacity-50">**</span>$1<span class="text-slate-400 font-normal opacity-50">**</span></strong>',
        );

        html = html.replace(
            /(?<!<[^>]*>)\*([^\n*]+?)\*(?![^<]*>)/g,
            '<em class="italic text-slate-800"><span class="text-slate-400 not-italic opacity-50">*</span>$1<span class="text-slate-400 not-italic opacity-50">*</span></em>',
        );

        html = html.replace(
            /____([^\n]+?)__/g,
            '<u class="underline decoration-slate-900 underline-offset-2"><span class="text-slate-400 no-underline opacity-50">__</span>$1<span class="text-slate-400 no-underline opacity-50">__</span></u>',
        );

        // Block Styles
        html = html.replace(
            /^###\s([^\n]*)/gm,
            '<span class="text-lg font-bold text-slate-800"><span class="text-slate-400 opacity-50">### </span>$1</span>',
        );
        html = html.replace(
            /^##\s([^\n]*)/gm,
            '<span class="text-xl font-bold text-slate-900"><span class="text-slate-400 opacity-50">## </span>$1</span>',
        );
        html = html.replace(
            /^#\s([^\n]*)/gm,
            '<span class="text-2xl font-extrabold text-slate-900"><span class="text-slate-400 opacity-50"># </span>$1</span>',
        );

        // Line Break
        html = html.replace(
            /^---$/gm,
            '<span class="text-slate-300 font-bold tracking-[0.5em] line-through decoration-slate-300 decoration-2 select-all">---</span>',
        );

        // Checkbox
        html = html.replace(
            /^-\s\[x\]\s([^\n]*)/gm,
            '<span class="text-slate-500 line-through decoration-slate-400"><span class="text-emerald-600 bg-emerald-50 rounded px-1 mr-1 font-mono font-bold">- [x]</span>$1</span>',
        );
        html = html.replace(
            /^-\s\[\s\]\s([^\n]*)/gm,
            '<span class="text-slate-800"><span class="text-slate-400 bg-slate-100 rounded px-1 mr-1 font-mono font-bold">- [ ]</span>$1</span>',
        );

        // Lists
        html = html.replace(
            /^-\s(?!(?:\[x\]|\[\s\]))([^\n]*)/gm,
            '<span class="text-slate-800"><span class="text-slate-400 font-bold mr-1">- </span>$1</span>',
        );
        html = html.replace(
            /^(\d+)\.\s([^\n]*)/gm,
            '<span class="text-slate-800"><span class="text-slate-400 font-bold mr-1">$1. </span>$2</span>',
        );

        // Image
        html = html.replace(/!\[([^\n]*)\]\(([^\n]*)\)/g, (alt, url) => {
            return `<span class="inline-flex flex-col items-start my-2">
                  <span class="text-blue-500 text-sm font-mono bg-blue-50/50 px-1 rounded break-all">![${alt}](${url})</span>
                  <img src="${url}" alt="${alt}" class="max-h-64 rounded-lg mt-1 border border-slate-200 shadow-sm" contenteditable="false" />
                </span>`;
        });

        if (html.endsWith("\n")) {
            html += "<br>";
        }

        return html;
    };

    const extractMarkdown = useCallback(() => {
        return editorRef.current?.textContent || "";
    }, []);

    const handleInput = () => {
        if (!editorRef.current) return;
        const caretPos = saveCaretPosition(editorRef.current);
        const rawMd = extractMarkdown();
        const newHtml = parseMarkdownHighlight(rawMd);

        if (editorRef.current.innerHTML !== newHtml) {
            editorRef.current.innerHTML = newHtml;
            restoreCaretPosition(editorRef.current, caretPos);
        }

        localStorage.setItem(
            draftKey,
            JSON.stringify({ title, content: rawMd }),
        );
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!editorRef.current) return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();

            let textToInsert = "\n";

            const fullText = editorRef.current.textContent || "";
            const caretPos = saveCaretPosition(editorRef.current) || 0;

            const textBeforeCaret = fullText.substring(0, caretPos);
            const lastNewLineIndex = textBeforeCaret.lastIndexOf("\n");
            const currentLineText = textBeforeCaret.substring(
                lastNewLineIndex + 1,
            );

            if (
                /^-\s$/.test(currentLineText) ||
                /^-\s\[\s\]\s$/.test(currentLineText) ||
                /^-\s\[x\]\s$/.test(currentLineText) ||
                /^\d+\.\s$/.test(currentLineText)
            ) {
                const textNode = document.createTextNode("");
                range.insertNode(textNode);

                const newText =
                    fullText.substring(0, caretPos - currentLineText.length) +
                    "\n" +
                    fullText.substring(caretPos);
                editorRef.current.innerHTML = parseMarkdownHighlight(newText);
                restoreCaretPosition(
                    editorRef.current,
                    caretPos - currentLineText.length + 1,
                );
                return;
            }

            const bulletMatch = currentLineText.match(/^-\s/);
            const checkboxEmptyMatch = currentLineText.match(/^-\s\[\s\]\s/);
            const checkboxCheckedMatch = currentLineText.match(/^-\s\[x\]\s/);
            const numberMatch = currentLineText.match(/^(\d+)\.\s/);

            if (checkboxEmptyMatch || checkboxCheckedMatch) {
                textToInsert = "\n[ ] ";
            } else if (bulletMatch) {
                textToInsert = "\n";
            } else if (numberMatch) {
                const nextNumber = parseInt(numberMatch[1], 10) + 1;
                textToInsert = `\n${nextNumber}. `;
            }

            const textNode = document.createTextNode(textToInsert);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);

            selection.removeAllRanges();
            selection.addRange(range);

            handleInput();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
        handleInput();
    };

    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey);
        let contentToLoad = initialContent;
        let titleToLoad = initialTitle;

        if (savedDraft && !initialContent && !initialTitle) {
            try {
                const parsed = JSON.parse(savedDraft);
                titleToLoad = parsed.title || "";
                contentToLoad = parsed.content || "";
            } catch (e) {}
        }

        setTitle(titleToLoad);
        if (editorRef.current) {
            editorRef.current.innerHTML = parseMarkdownHighlight(contentToLoad);
        }
    }, [initialContent, initialTitle, draftKey]);

    const handleManualSave = async () => {
        const currentMarkdown = extractMarkdown();
        if (!currentMarkdown.trim() && !title.trim()) return;

        setIsSaving(true);
        try {
            await onSave(title, currentMarkdown);
            localStorage.removeItem(draftKey);
            setTitle("");
            if (editorRef.current) editorRef.current.innerHTML = "";
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <input
                type="text"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                    localStorage.setItem(
                        draftKey,
                        JSON.stringify({
                            title: e.target.value,
                            content: extractMarkdown(),
                        }),
                    );
                }}
                className="w-full px-4 pt-3 pb-1 text-base font-bold text-slate-900 outline-none border-b border-transparent focus:border-slate-100 placeholder:text-slate-400"
            />

            <div className="relative min-h-[140px]">

                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onDragOver={(e) => e.preventDefault()}
                    data-placeholder={placeholder}
                    className="w-full whitespace-pre-wrap break-words min-h-[120px] max-h-[400px] overflow-y-auto px-4 py-2 text-slate-800 text-sm leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none focus:outline-none"
                />
            </div>

            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <ImageIcon size={14} /> Drag & drop image
                    {isDraftSaved && (
                        <span className="ml-2 text-emerald-600 flex items-center gap-1">
                            <Check size={12} /> Saved
                        </span>
                    )}
                </span>
                <button
                    onClick={handleManualSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Save size={14} />
                    )}
                    <span>Save Note</span>
                </button>
            </div>
        </div>
    );
}
