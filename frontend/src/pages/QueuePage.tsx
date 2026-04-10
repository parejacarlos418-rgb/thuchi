import { useEffect, useState } from 'react';
import { Play, Pause, Square, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { StatusBadge } from '../components/StatusBadge';
import { GenerationSettings } from '../components/GenerationSettings';
import * as storage from '../lib/taskStorage';
import type { AppConfig } from '../types';

const queueStatusLabels: Record<string, string> = {
  idle: 'Chờ',
  running: 'Đang chạy',
  paused: 'Tạm dừng',
};

export function QueuePage() {
  const { tasks, queueStatus, queueProgress, setConfig, setTasks, setStats, setQueueStatus, addToast } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [configForm, setConfigForm] = useState<AppConfig | null>(null);

  const queueTasks = tasks.filter((t) => ['pending', 'queued', 'generating', 'downloading'].includes(t.status));
  const isActive = queueStatus === 'running' || queueStatus === 'paused';

  useEffect(() => {
    const cfg = storage.getConfig();
    setConfig(cfg);
    setConfigForm(cfg);
    setTasks(storage.getAllTasks());
    setStats(storage.getStats());
  }, []);

  const refreshData = () => {
    setTasks(storage.getAllTasks());
    setStats(storage.getStats());
  };

  const addPrompt = () => {
    const text = prompt.trim();
    if (!text) return;
    storage.createTask(text);
    setPrompt('');
    refreshData();

    // Auto-start queue
    if (queueStatus === 'idle') {
      const cfg = storage.getConfig();
      if (cfg.access_token && cfg.project_id) {
        setQueueStatus('running');
      } else {
        addToast('Cần cấu hình token và project ID trong Cài đặt', 'error');
      }
    }
  };

  const addBatch = () => {
    const lines = prompt.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return;
    lines.forEach((line) => storage.createTask(line.trim()));
    setPrompt('');
    refreshData();
    addToast(`Đã thêm ${lines.length} prompt`, 'success');
  };

  const deleteTask = (id: number) => {
    storage.deleteTask(id);
    refreshData();
  };

  const startQueue = () => {
    const cfg = storage.getConfig();
    if (!cfg.access_token || !cfg.project_id) {
      addToast('Cần cấu hình token và project ID trong Cài đặt', 'error');
      return;
    }
    setQueueStatus('running');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addPrompt(); }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-white mb-4 shrink-0">Hàng đợi</h2>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {queueStatus === 'idle' || queueStatus === 'paused' ? (
            <button onClick={queueStatus === 'paused' ? () => setQueueStatus('running') : startQueue} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors">
              <Play size={14} /> {queueStatus === 'paused' ? 'Tiếp tục' : 'Bắt đầu'}
            </button>
          ) : (
            <button onClick={() => setQueueStatus('paused')} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm transition-colors">
              <Pause size={14} /> Tạm dừng
            </button>
          )}
          <button onClick={() => setQueueStatus('idle')} disabled={queueStatus === 'idle'} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm disabled:opacity-30 transition-colors">
            <Square size={14} /> Dừng
          </button>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          queueStatus === 'running' ? 'bg-green-900/50 text-green-400' :
          queueStatus === 'paused' ? 'bg-yellow-900/50 text-yellow-400' :
          'bg-gray-800 text-gray-500'
        }`}>{queueStatusLabels[queueStatus] || queueStatus}</span>
      </div>

      {/* Progress */}
      {queueProgress && (
        <div className={`flex items-center gap-2.5 mb-3 px-3.5 py-2.5 rounded-lg border text-sm shrink-0 ${
          queueProgress.step === 'error' ? 'bg-red-950/50 border-red-800/70 text-red-300' :
          queueProgress.step === 'completed' ? 'bg-green-950/50 border-green-800/70 text-green-300' :
          'bg-blue-950/40 border-blue-800/60 text-blue-300'
        }`}>
          {queueProgress.step !== 'error' && queueProgress.step !== 'completed' && <Loader2 size={15} className="animate-spin shrink-0" />}
          {queueProgress.step === 'completed' && <span className="text-green-400 shrink-0 text-base">&#10003;</span>}
          {queueProgress.step === 'error' && <span className="text-red-400 shrink-0 text-base">&#10007;</span>}
          <span className="flex-1">{queueProgress.detail}</span>
        </div>
      )}

      {/* Settings */}
      {configForm && <GenerationSettings form={configForm} onFormChange={setConfigForm} />}

      {/* Add Prompt */}
      <div className="flex gap-2 mb-3 shrink-0">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập prompt video... (nhiều dòng = nhiều prompt)"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500"
          rows={2}
        />
        <div className="flex flex-col gap-1 self-end">
          <button onClick={addPrompt} disabled={!prompt.trim()} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm disabled:opacity-30 transition-colors">
            <Plus size={14} /> Thêm
          </button>
          {prompt.includes('\n') && (
            <button onClick={addBatch} className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-colors">
              Thêm tất cả ({prompt.trim().split('\n').filter(Boolean).length})
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-lg divide-y divide-gray-800">
          {queueTasks.length === 0 ? (
            <p className="p-4 text-sm text-gray-600">Hàng đợi trống. Thêm prompt ở trên.</p>
          ) : (
            queueTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/40 transition-colors">
                <span className="text-sm text-gray-300 truncate flex-1 min-w-0">{task.prompt}</span>
                <StatusBadge status={task.status} />
                <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0" title="Xóa">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
