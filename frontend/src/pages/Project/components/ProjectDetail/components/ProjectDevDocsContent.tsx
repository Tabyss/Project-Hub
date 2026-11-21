import type { Project } from "../../../../../types";
import ChangelogSection from "./ChangelogSection";
import MarkdownRenderer from "./MarkdownRenderer";
import RoadmapSection from "./RoadmapSection";

export default function DevDocsContent({ project }: { project: Project }) {
    return (
        <div className="space-y-12">
            {project.documentation_content ? (
                <section>
                    <MarkdownRenderer content={project.documentation_content} />
                </section>
            ) : (
                <p className="text-ink-muted text-sm italic">
                    Belum ada dokumentasi teknis yang ditambahkan.
                </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8 border-t border-line">
                <div className="lg:col-span-1">
                    <RoadmapSection projectId={project.id} />
                </div>
                <div className="lg:col-span-2">
                    <ChangelogSection projectId={project.id} />
                </div>
            </div>
        </div>
    );
}
