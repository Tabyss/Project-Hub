import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../../types";
import {
    useProject,
    useCreateProject,
    useUpdateProject,
} from "../queries/useProjects";

const DEFAULT_FORM_DATA: Partial<Project> = {
    title: "",
    slug: "",
    tagline: "",
    category: ["Web App"],
    visibility: "Public",
    status: "Active",
    is_favorite: false,
    role: "Full Stack Developer",
    tools: [],
    cover_img: "",
    media_urls: [],
    repo_url: "",
    live_url: "",
    portfolio_content: "",
    documentation_content: "",
};

const generateSlug = (title: string) =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

export function useProjectForm(slug?: string) {
    const navigate = useNavigate();
    const isEditMode = Boolean(slug);

    const { data: initialData, isLoading: isLoadingData } = useProject(
        slug || "",
    );
    const { mutate: createProject, isPending: isCreating } = useCreateProject();
    const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

    const [formData, setFormData] =
        useState<Partial<Project>>(DEFAULT_FORM_DATA);

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData(initialData);
        }
    }, [initialData, isEditMode]);

    const updateField = useCallback(
        <K extends keyof Project>(field: K, value: Project[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const handleTitleChange = useCallback(
        (title: string) => {
            setFormData((prev) => ({
                ...prev,
                title,
                ...(!isEditMode && { slug: generateSlug(title) }),
            }));
        },
        [isEditMode],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && initialData) {
            updateProject(
                { id: initialData.id, data: formData },
                { onSuccess: () => navigate(`/project/${formData.slug}`) },
            );
        } else {
            createProject(formData, { onSuccess: () => navigate("/") });
        }
    };

    return {
        formData,
        isEditMode,
        isLoadingData,
        isPending: isCreating || isUpdating,
        updateField,
        handleTitleChange,
        handleSubmit,
    };
}
