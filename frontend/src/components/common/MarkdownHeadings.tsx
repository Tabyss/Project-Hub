import React from "react";

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

const getNodeText = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }
    if (Array.isArray(node)) {
        return node.map(getNodeText).join("");
    }
    if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.props.children) {
        return getNodeText(node.props.children);
    }
    return "";
};

export const markdownComponents = {
    h1: ({ children }: { children?: React.ReactNode }) => {
        const text = getNodeText(children);
        const id = slugify(text);
        return (
            <h1
                id={id}
                className="text-3xl font-extrabold text-slate-900 tracking-tight mt-8 mb-4 border-b border-slate-200 pb-2"
            >
                {children}
            </h1>
        );
    },
    h2: ({ children }: { children?: React.ReactNode }) => {
        const text = getNodeText(children);
        const id = slugify(text);
        return (
            <h2
                id={id}
                className="text-2xl font-bold text-slate-900 tracking-tight mt-6 mb-3 border-b border-slate-100 pb-1.5"
            >
                {children}
            </h2>
        );
    },
    h3: ({ children }: { children?: React.ReactNode }) => {
        const text = getNodeText(children);
        const id = slugify(text);
        return (
            <h3
                id={id}
                className="text-xl font-bold text-slate-800 tracking-tight mt-5 mb-2"
            >
                {children}
            </h3>
        );
    },

    // Paragraph
    p: ({ children }: { children?: React.ReactNode }) => (
        <p className="text-slate-700 leading-relaxed mb-4 text-base">
            {children}
        </p>
    ),

    // Bold & Italic
    strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-bold text-slate-900">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
        <em className="italic text-slate-800">{children}</em>
    ),

    // Lists
    ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="list-disc list-inside space-y-1.5 mb-4 text-slate-700 pl-2">
            {children}
        </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="list-decimal list-inside space-y-1.5 mb-4 text-slate-700 pl-2">
            {children}
        </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
    ),

    // Blockquote
    blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="border-l-4 border-blue-500 bg-slate-50 pl-4 py-2 my-4 rounded-r-lg text-slate-700 italic">
            {children}
        </blockquote>
    ),

    // Code Block & Inline Code
    code: ({
        inline,
        children,
    }: {
        inline?: boolean;
        children?: React.ReactNode;
    }) => {
        if (inline) {
            return (
                <code className="bg-slate-100 text-blue-600 font-mono text-sm px-1.5 py-0.5 rounded border border-slate-200">
                    {children}
                </code>
            );
        }
        return (
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto font-mono text-sm my-4 shadow-sm border border-slate-800">
                <code>{children}</code>
            </pre>
        );
    },

    // Links
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:underline decoration-blue-400 underline-offset-2 transition-colors"
        >
            {children}
        </a>
    ),

    // Horizontal Rule
    hr: () => <hr className="my-8 border-slate-200" />,
};
