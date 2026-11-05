import { Loader2, UploadCloud, X, Plus } from "lucide-react";
import type { Project } from "../../../../types";
import { useMedia } from "../../../../hooks/useMedia";

interface ProjectMediaSectionProps {
  formData: Partial<Project>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Project>>>;
}

export default function ProjectMediaSection({
  formData,
  setFormData,
}: ProjectMediaSectionProps) {
  const { isUploading, coverInputRef, galleryInputRef, uploadSingleImage } =
    useMedia();

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadSingleImage(file);
    if (url) {
      setFormData((prev) => ({ ...prev, cover_img: url }));
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadSingleImage(file);
    if (url) {
      const currentMedia = formData.media_urls || [];
      setFormData((prev) => ({ ...prev, media_urls: [...currentMedia, url] }));
    }
  };

  const handleRemoveGalleryItem = (indexToRemove: number) => {
    const updatedMedia = (formData.media_urls || []).filter(
      (_, idx) => idx !== indexToRemove,
    );
    setFormData((prev) => ({ ...prev, media_urls: updatedMedia }));
  };

  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
        2. Media & Links
      </h2>
      <div className="space-y-6">
        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Cover Image
          </label>
          {formData.cover_img ? (
            <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200 group">
              <img
                src={formData.cover_img}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, cover_img: "" }))
                }
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => coverInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              {isUploading ? (
                <Loader2 className="animate-spin mb-2" size={28} />
              ) : (
                <UploadCloud className="mb-2" size={28} />
              )}
              <span className="text-sm font-medium">
                {isUploading ? "Uploading..." : "Click to select an image"}
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

        {/* Gallery / Additional Media */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Project Media / Screenshots
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.media_urls?.map((url, idx) => (
              <div
                key={idx}
                className="relative h-28 rounded-lg overflow-hidden border border-slate-200 group"
              >
                <img
                  src={url}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryItem(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <div
              onClick={() => galleryInputRef.current?.click()}
              className="h-28 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Plus size={20} />
              <span className="text-xs font-medium mt-1">Add Image</span>
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

        {/* Repository & Live Demo URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Repository URL (GitHub/GitLab)
            </label>
            <input
              type="url"
              value={formData.repo_url || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, repo_url: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Live Demo URL
            </label>
            <input
              type="url"
              value={formData.live_url || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, live_url: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}