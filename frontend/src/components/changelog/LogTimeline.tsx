import { useState } from "react";
import { useLogs } from "../../hooks/useLogs";
import ReactMarkdown from "react-markdown";
import { GitCommit, Plus } from "lucide-react";
import LogForm from "../forms/LogForm";
import Modal from "../common/Modal";

export default function LogTimeline({ projectId }: { projectId: string }) {
    const { data: logs, isLoading } = useLogs(projectId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="animate-pulse h-40 bg-slate-100 rounded-lg"></div>
        );
    }

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mb-6 border-b pb-2">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <GitCommit className="text-blue-600" /> Changelog History
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm font-semibold"
                    title="Tambah Log Baru"
                >
                    <Plus size={18} />
                </button>
            </div>

            {!logs || logs.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 text-sm mb-3">
                        Belum ada riwayat pembaruan.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        <Plus size={16} /> Buat Log Pertama
                    </button>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 md:ml-4 space-y-8 pb-4">
                    {logs.map((log) => (
                        <div key={log.id} className="relative pl-6 md:pl-8">
                            {/* Dot Timeline */}
                            <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-[9px] top-1.5 border-4 border-white shadow-sm" />

                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    {log.version && (
                                        <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-bold rounded">
                                            {log.version}
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded uppercase">
                                        {log.log_type}
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">
                                        {new Date(
                                            log.created_at
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">
                                    {log.title}
                                </h4>
                                {log.details && (
                                    <div className="prose prose-sm prose-slate max-w-none text-slate-600">
                                        <ReactMarkdown>{log.details}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tambah Log Baru"
            >
                <LogForm
                    projectId={projectId}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}