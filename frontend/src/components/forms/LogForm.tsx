import { useState } from 'react';
import { useCreateLog } from '../../hooks/useLogs';
import { Loader2 } from 'lucide-react';
import type { LogType } from '../../types';

export default function LogForm({ projectId, onSuccess }: { projectId: string, onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('');
  const [details, setDetails] = useState('');
  const [logType, setLogType] = useState<LogType>('feature');
  const { mutate: createLog, isPending } = useCreateLog(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    createLog({ title, version, details, log_type: logType }, {
      onSuccess: () => onSuccess()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Update</label>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Misal: Rilis versi awal" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Versi (Opsional)</label>
          <input type="text" value={version} onChange={(e) => setVersion(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="v1.0.0" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Tipe Log</label>
          <select value={logType} onChange={(e) => setLogType(e.target.value as LogType)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="feature">Feature</option>
            <option value="bugfix">Bugfix</option>
            <option value="refactor">Refactor</option>
            <option value="docs">Docs</option>
            <option value="release">Release</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Detail (Mendukung Markdown)</label>
        <textarea rows={4} value={details} onChange={(e) => setDetails(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="- Menambahkan fitur X&#10;- Memperbaiki bug Y" />
      </div>
      <button type="submit" disabled={isPending}
        className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 disabled:bg-slate-600 flex justify-center items-center gap-2 mt-4">
        {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Publish Log'}
      </button>
    </form>
  );
}