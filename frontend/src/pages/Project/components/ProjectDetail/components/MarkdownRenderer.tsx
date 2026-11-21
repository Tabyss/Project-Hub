import React from "react";
import ReactMarkdown from "react-markdown";

export const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

const getNodeText = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number")
        return String(node);
    if (Array.isArray(node)) return node.map(getNodeText).join("");
    if (
        React.isValidElement<{ children?: React.ReactNode }>(node) &&
        node.props.children
    ) {
        return getNodeText(node.props.children);
    }
    return "";
};

const createHeading = (Tag: "h1" | "h2" | "h3", className: string) => {
    return ({ children }: { children?: React.ReactNode }) => {
        const id = slugify(getNodeText(children));
        return (
            <Tag id={id} className={className}>
                {children}
            </Tag>
        );
    };
};

export const markdownComponents = {
    h1: createHeading(
        "h1",
        "text-2xl md:text-3xl font-extrabold text-ink tracking-tight mt-8 mb-4 border-b border-line pb-2",
    ),
    h2: createHeading(
        "h2",
        "text-xl md:text-2xl font-bold text-ink tracking-tight mt-6 mb-3 border-b border-line pb-1.5",
    ),
    h3: createHeading(
        "h3",
        "text-lg md:text-xl font-bold text-ink tracking-tight mt-5 mb-2",
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
        <p className="text-ink-muted leading-relaxed mb-4 text-base">
            {children}
        </p>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-bold text-ink">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
        <em className="italic text-ink">{children}</em>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="list-disc list-inside space-y-1.5 mb-4 text-ink-muted pl-2">
            {children}
        </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="list-decimal list-inside space-y-1.5 mb-4 text-ink-muted pl-2">
            {children}
        </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="border-l-4 border-coral bg-surface pl-4 py-2.5 my-4 rounded-r-xl text-ink-muted italic">
            {children}
        </blockquote>
    ),
    code: ({
        inline,
        children,
    }: {
        inline?: boolean;
        children?: React.ReactNode;
    }) => {
        if (inline) {
            return (
                <code className="bg-surface text-coral font-mono text-sm px-1.5 py-0.5 rounded-md border border-line">
                    {children}
                </code>
            );
        }
        return (
            <pre className="bg-ink text-canvas p-4 rounded-2xl overflow-x-auto font-mono text-sm my-4 border border-line">
                <code>{children}</code>
            </pre>
        );
    },
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral font-medium hover:underline underline-offset-2 transition-colors"
        >
            {children}
        </a>
    ),
    hr: () => <hr className="my-8 border-line" />,
};

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    );
}
