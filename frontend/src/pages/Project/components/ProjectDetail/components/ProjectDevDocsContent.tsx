import ReactMarkdown from "react-markdown";
import LogTimeline from "../../../../../components/changelog/LogTimeline";
import { markdownComponents } from "../../../../../components/common/MarkdownHeadings";
import Roadmap from "../../../../../components/docs/Roadmap";
import type { Project } from "../../../../../types";


interface ProjectDevDocsContentProps {
    project: Project;
}

export default function ProjectDevDocsContent({
    project,
}: ProjectDevDocsContentProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {project.documentation_content ? (
                <section>
                    <ReactMarkdown components={markdownComponents}>
                        {project.documentation_content}
                    </ReactMarkdown>
                </section>
            ) : (
                <p className="text-slate-400 italic">
                    Belum ada dokumentasi teknis yang ditambahkan.
                </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-200">
                <div className="lg:col-span-1 roadmap-section">
                    <Roadmap projectId={project.id} />
                </div>
                <div className="lg:col-span-2 changelog-section">
                    <LogTimeline projectId={project.id} />
                </div>
            </div>
        </div>
    );
}
