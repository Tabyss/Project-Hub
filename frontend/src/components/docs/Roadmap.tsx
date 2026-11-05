import { useState } from "react";
import { usePlans, useTogglePlan } from "../../hooks/usePlans";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import PlanForm from "../forms/PlanForm";
import Modal from "../common/Modal";

export default function Roadmap({ projectId }: { projectId: string }) {
    const { data: plans, isLoading } = usePlans(projectId);
    const { mutate: togglePlan, isPending } = useTogglePlan(projectId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="animate-pulse h-20 bg-slate-100 rounded-lg"></div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-xl font-bold text-slate-900">
                    Next Plans & Roadmap
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm font-semibold"
                    title="Tambah Plan Baru"
                >
                    <Plus size={18} />
                </button>
            </div>

            {!plans || plans.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 text-sm mb-3">
                        Belum ada roadmap untuk proyek ini.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        <Plus size={16} /> Buat Plan Pertama
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                plan.is_completed ? "bg-slate-50" : "hover:bg-slate-50"
                            }`}
                        >
                            <button
                                onClick={() => togglePlan(plan.id)}
                                disabled={isPending}
                                className="mt-0.5 focus:outline-none flex-shrink-0"
                            >
                                {plan.is_completed ? (
                                    <CheckCircle2
                                        className="text-emerald-500"
                                        size={20}
                                    />
                                ) : (
                                    <Circle
                                        className="text-slate-300 hover:text-blue-500"
                                        size={20}
                                    />
                                )}
                            </button>
                            <div
                                className={`flex-1 ${
                                    plan.is_completed
                                        ? "line-through text-slate-400"
                                        : "text-slate-700"
                                }`}
                            >
                                <p className="font-medium">{plan.task}</p>
                                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
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
                <PlanForm
                    projectId={projectId}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}