import { Loader2, UploadCloud, X, Plus } from "lucide-react";
import { useMedia } from "../../../../../hooks/queries/useMedia";
import type { Project } from "../../../../../types";

interface MediaSectionProps {
    formData: Partial<Project>;
    updateField: <K extends keyof Project>(field: K, value: Project[K]) => void;
}

const INPUT_CLASS =
    "w-full px-4 py-2.5 bg-canvas border border-line rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all";

export default function MediaSection({
    formData,
    updateField,
}: MediaSectionProps) {
    const { isUploading, coverInputRef, galleryInputRef, uploadSingleImage } =
        useMedia();

    const handleCoverUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadSingleImage(file);
        if (url) updateField("cover_img", url);
        e.target.value = "";
    };

    const handleGalleryUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadSingleImage(file);
        if (url) {
            updateField("media_urls", [...(formData.media_urls || []), url]);
        }
        e.target.value = "";
    };

    const handleRemoveGalleryItem = (indexToRemove: number) => {
        updateField(
            "media_urls",
            (formData.media_urls || []).filter(
                (_, idx) => idx !== indexToRemove,
            ),
        );
    };

    return (
        <section className="bg-surface p-6 rounded-[24px] border border-line">
            <h2 className="text-base font-bold text-ink mb-6 pb-3 border-b border-line">
                2. Media & Links
            </h2>

            <div className="space-y-5">
                {/* Cover Image */}
                <div>
                    <label className="block text-xs font-semibold text-ink mb-2">
                        Cover Image
                    </label>
                    {formData.cover_img ? (
                        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-line group">
                            <img
                                src={formData.cover_img}
                                alt="Cover Preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => updateField("cover_img", "")}
                                className="absolute top-2.5 right-2.5 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => coverInputRef.current?.click()}
                            className="w-full h-36 border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center text-ink-muted cursor-pointer hover:bg-canvas hover:border-coral hover:text-coral transition-colors"
                        >
                            {isUploading ? (
                                <Loader2
                                    className="animate-spin mb-2"
                                    size={24}
                                />
                            ) : (
                                <UploadCloud className="mb-2" size={24} />
                            )}
                            <span className="text-xs font-medium">
                                {isUploading
                                    ? "Uploading..."
                                    : "Click to upload cover"}
                            </span>
                            <input
                                type="file"
                                ref={coverInputRef}
                                onChange={handleCoverUpload}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                            />
                        </div>
                    )}
                </div>

                {/* Gallery */}
                <div>
                    <label className="block text-xs font-semibold text-ink mb-2">
                        Screenshots / Media
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                        {formData.media_urls?.map((url, idx) => (
                            <div
                                key={idx}
                                className="relative h-20 rounded-xl overflow-hidden border border-line group"
                            >
                                <img
                                    src={url}
                                    alt={`Screenshot ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryItem(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}

                        <div
                            onClick={() => galleryInputRef.current?.click()}
                            className="h-20 border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center text-ink-muted hover:text-coral hover:border-coral hover:bg-canvas cursor-pointer transition-colors"
                        >
                            <Plus size={18} />
                            <span className="text-[11px] font-medium mt-1">
                                Add
                            </span>
                            <input
                                type="file"
                                ref={galleryInputRef}
                                onChange={handleGalleryUpload}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Links */}
                <div className="space-y-3 pt-2 border-t border-line">
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">
                            Repository URL
                        </label>
                        <input
                            type="url"
                            value={formData.repo_url || ""}
                            onChange={(e) =>
                                updateField("repo_url", e.target.value)
                            }
                            className={INPUT_CLASS}
                            placeholder="https://github.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">
                            Live Demo URL
                        </label>
                        <input
                            type="url"
                            value={formData.live_url || ""}
                            onChange={(e) =>
                                updateField("live_url", e.target.value)
                            }
                            className={INPUT_CLASS}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
