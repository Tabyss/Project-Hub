import { useState } from 'react';
import { useCreatePlan } from '../../hooks/usePlans';
import { Loader2 } from 'lucide-react';
import type { Priority } from '../../types';

export default function PlanForm({ projectId, onSuccess }: { projectId: string, onSuccess: () => void }) {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const { mutate: createPlan, isPending } = useCreatePlan(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    
    createPlan({ task, priority }, {
      onSuccess: () => {
        setTask('');
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Task / Target</label>
        <input 
          type="text" 
          required 
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Misal: Implementasi sistem Auth..."
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Prioritas</label>
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex justify-center items-center gap-2 transition-colors mt-4"
      >
        {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Plan'}
      </button>
    </form>
  );
}