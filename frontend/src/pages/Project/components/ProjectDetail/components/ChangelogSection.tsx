import { Loader2, GitCommit, Plus } from "lucide-react";
import { useState } from "react";
import Modal from "../../../../../components/common/Modal";
import { useCreateLog, useLogs } from "../../../../../hooks/queries/useLogs";
import type { LogType } from "../../../../../types";
import { DsButton } from "../../../../DesignSystem/DesignSystemPage";
import MarkdownRenderer from "./MarkdownRenderer";

const INPUT_CLASS =
    "w-full px-4 py-2.5 bg-canvas border border-line rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all";

function CreateLogForm({
    projectId,
    onSuccess,
}: {
    projectId: string;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState("");
    const [version, setVersion] = useState("");
    const [details, setDetails] = useState("");
    const [logType, setLogType] = useState<LogType>("feature");
    const { mutate: createLog, isPending } = useCreateLog(projectId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        createLog(
            { title, version, details, log_type: logType },
            { onSuccess },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                    Judul Update
                </label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="Misal: Rilis versi awal"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                        Versi (Opsional)
                    </label>
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        className={INPUT_CLASS}
                        placeholder="v1.0.0"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                        Tipe Log
                    </label>
                    <select
                        value={logType}
                        onChange={(e) => setLogType(e.target.value as LogType)}
                        className={INPUT_CLASS}
                    >
                        <option value="feature">Feature</option>
                        <option value="bugfix">Bugfix</option>
                        <option value="refactor">Refactor</option>
                        <option value="docs">Docs</option>
                        <option value="release">Release</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                    Detail (Mendukung Markdown)
                </label>
                <textarea
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className={`${INPUT_CLASS} font-mono`}
                    placeholder="- Menambahkan fitur X&#10;- Memperbaiki bug Y"
                />
            </div>
            <div className="pt-2">
                <DsButton type="submit" variant="coral" disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : (
                        "Publish Log"
                    )}
                </DsButton>
            </div>
        </form>
    );
}

export default function ChangelogSection({ projectId }: { projectId: string }) {
    const { data: logs = [], isLoading } = useLogs(projectId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) {
        return <div className="animate-pulse h-40 bg-surface rounded-[24px]" />;
    }

    return (
        <section className="bg-surface border border-line rounded-[24px] p-5">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-line">
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                    <GitCommit size={18} className="text-coral" /> Changelog
                    History
                </h3>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 bg-coral/10 text-coral rounded-lg hover:bg-coral/20 transition-colors cursor-pointer"
                    title="Tambah Log Baru"
                >
                    <Plus size={16} />
                </button>
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-8 px-4 bg-canvas border border-dashed border-line rounded-2xl">
                    <p className="text-ink-muted text-xs mb-3">
                        Belum ada riwayat pembaruan.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs text-coral hover:underline font-semibold cursor-pointer"
                    >
                        <Plus size={14} /> Buat Log Pertama
                    </button>
                </div>
            ) : (
                <div className="relative border-l-2 border-line ml-2.5 space-y-6 pb-2">
                    {logs.map((log) => (
                        <div key={log.id} className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-coral rounded-full -left-[7px] top-1.5 ring-4 ring-surface" />

                            <div className="bg-canvas border border-line rounded-2xl p-4">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {log.version && (
                                        <span className="px-2 py-0.5 bg-ink text-canvas text-[11px] font-bold rounded-md font-mono">
                                            {log.version}
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-coral/10 text-coral text-[10px] font-bold rounded-md uppercase tracking-wider">
                                        {log.log_type}
                                    </span>
                                    <span className="text-xs text-ink-muted">
                                        {new Date(
                                            log.created_at,
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>

                                <h4 className="text-sm font-bold text-ink mb-1.5">
                                    {log.title}
                                </h4>

                                {log.details && (
                                    <div className="text-sm">
                                        <MarkdownRenderer
                                            content={log.details}
                                        />
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
                <CreateLogForm
                    projectId={projectId}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </section>
    );
}
