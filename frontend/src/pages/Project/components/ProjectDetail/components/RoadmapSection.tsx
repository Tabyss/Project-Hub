import { Loader2, Plus, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import Modal from "../../../../../components/common/Modal";
import {
    useCreatePlan,
    usePlans,
    useTogglePlan,
} from "../../../../../hooks/queries/usePlans";
import type { Priority } from "../../../../../types";
import { DsButton } from "../../../../DesignSystem/DesignSystemPage";

const INPUT_CLASS =
    "w-full px-4 py-2.5 bg-canvas border border-line rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all";

function CreatePlanForm({
    projectId,
    onSuccess,
}: {
    projectId: string;
    onSuccess: () => void;
}) {
    const [task, setTask] = useState("");
    const [priority, setPriority] = useState<Priority>("Medium");
    const { mutate: createPlan, isPending } = useCreatePlan(projectId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task.trim()) return;

        createPlan(
            { task, priority },
            {
                onSuccess: () => {
                    setTask("");
                    onSuccess();
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                    Nama Task / Target
                </label>
                <input
                    type="text"
                    required
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="Misal: Implementasi sistem Auth..."
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                    Prioritas
                </label>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className={INPUT_CLASS}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div className="pt-2">
                <DsButton type="submit" variant="coral" disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : (
                        "Simpan Plan"
                    )}
                </DsButton>
            </div>
        </form>
    );
}

export default function RoadmapSection({ projectId }: { projectId: string }) {
    const { data: plans = [], isLoading } = usePlans(projectId);
    const { mutate: togglePlan, isPending } = useTogglePlan();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-surface rounded-[24px]" />;
    }

    return (
        <section className="bg-surface border border-line rounded-[24px] p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
                <h3 className="text-base font-bold text-ink">
                    Roadmap & Plans
                </h3>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 bg-coral/10 text-coral rounded-lg hover:bg-coral/20 transition-colors cursor-pointer"
                    title="Tambah Plan Baru"
                >
                    <Plus size={16} />
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-8 px-4 bg-canvas border border-dashed border-line rounded-2xl">
                    <p className="text-ink-muted text-xs mb-3">
                        Belum ada roadmap untuk proyek ini.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs text-coral hover:underline font-semibold cursor-pointer"
                    >
                        <Plus size={14} /> Buat Plan Pertama
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                                plan.is_completed
                                    ? "bg-canvas/60"
                                    : "hover:bg-canvas"
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => togglePlan(plan.id)}
                                disabled={isPending}
                                className="mt-0.5 shrink-0 cursor-pointer"
                            >
                                {plan.is_completed ? (
                                    <CheckCircle2
                                        className="text-emerald-500"
                                        size={18}
                                    />
                                ) : (
                                    <Circle
                                        className="text-ink-muted hover:text-coral transition-colors"
                                        size={18}
                                    />
                                )}
                            </button>
                            <div
                                className={`flex-1 min-w-0 ${
                                    plan.is_completed
                                        ? "line-through text-ink-muted"
                                        : "text-ink"
                                }`}
                            >
                                <p className="text-sm font-medium leading-snug">
                                    {plan.task}
                                </p>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                                    Priority: {plan.priority}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tambah Roadmap Baru"
            >
                <CreatePlanForm
                    projectId={projectId}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </section>
    );
}
