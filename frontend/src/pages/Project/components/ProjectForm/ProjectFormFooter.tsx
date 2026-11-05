import { Link } from "react-router-dom";
import { Loader2, Save } from "lucide-react";

interface ProjectFormFooterProps {
    isEditMode: boolean;
    slug?: string;
    isPending: boolean;
    isUploading: boolean;
}

export default function ProjectFormFooter({
    isEditMode,
    slug,
    isPending,
    isUploading,
}: ProjectFormFooterProps) {
    return (
        <div className="fixed top-16 left-0 right-0 bg-white backdrop-blur-md  p-4 z-50">
            <div className="flex justify-end gap-3">
                <Link
                    to={isEditMode ? `/project/${slug}` : "/"}
                    className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="bg-blue-600 text-white font-bold px-8 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <Save size={20} />{" "}
                            {isEditMode ? "Save Changes" : "Publish Project"}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
