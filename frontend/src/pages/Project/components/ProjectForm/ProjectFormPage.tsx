import { useParams, Link } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import { useProjectForm } from "../../../../hooks/ui/useProjectForm";
import { DsButton } from "../../../DesignSystem/DesignSystemPage";
import MarkdownEditor from "./form/MarkdownEditor";
import BasicInfoSection from "./form/BasicInfoSection";
import MediaSection from "./form/MediaSection";

export default function ProjectFormPage() {
    const { slug } = useParams<{ slug: string }>();
    const {
        formData,
        isEditMode,
        isLoadingData,
        isPending,
        updateField,
        handleTitleChange,
        handleSubmit,
    } = useProjectForm(slug);

    if (isEditMode && isLoadingData) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-coral w-9 h-9" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
                <h1 className="text-3xl font-bold tracking-tight text-ink">
                    {isEditMode ? "Edit Project" : "Create New Project"}
                </h1>

                <div className="flex items-center gap-2">
                    <Link to={isEditMode ? `/project/${slug}` : "/"}>
                        <DsButton variant="secondary" type="button">
                            Cancel
                        </DsButton>
                    </Link>
                    <DsButton
                        type="submit"
                        variant="coral"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <>
                                <Save size={15} />{" "}
                                {isEditMode ? "Save Changes" : "Publish"}
                            </>
                        )}
                    </DsButton>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <BasicInfoSection
                    formData={formData}
                    updateField={updateField}
                    onTitleChange={handleTitleChange}
                />
                <MediaSection formData={formData} updateField={updateField} />
            </div>

            {/* Markdown Sections */}
            <section className="bg-surface p-6 rounded-[24px] border border-line">
                <h2 className="text-base font-bold text-ink mb-4 pb-2 border-b border-line">
                    3. Portfolio Story
                </h2>
                <MarkdownEditor
                    label="Portfolio Content"
                    value={formData.portfolio_content || ""}
                    onChange={(val) => updateField("portfolio_content", val)}
                    placeholder="Write the full problem, solution, methodology, and impact..."
                    rows={8}
                />
            </section>

            <section className="bg-surface p-6 rounded-[24px] border border-line">
                <h2 className="text-base font-bold text-ink mb-4 pb-2 border-b border-line">
                    4. Technical Documentation
                </h2>
                <MarkdownEditor
                    label="Documentation Content"
                    value={formData.documentation_content || ""}
                    onChange={(val) =>
                        updateField("documentation_content", val)
                    }
                    placeholder="Write architecture overviews, API specs, deployment notes..."
                    rows={8}
                />
            </section>
        </form>
    );
}
