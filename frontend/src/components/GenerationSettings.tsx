import { useState } from 'react';
import { Save, FolderOpen, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { wailsApi } from '../lib/wailsApi';
import type { AppConfig } from '../types';

interface Props {
  form: AppConfig;
  onFormChange: (form: AppConfig) => void;
}

export function GenerationSettings({ form, onFormChange }: Props) {
  const { setConfig, addToast } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [dirty, setDirty] = useState(false);

  const updateField = (key: keyof AppConfig, value: any) => {
    onFormChange({ ...form, [key]: value });
    setDirty(true);
  };

  const saveSettings = async () => {
    try {
      await wailsApi.UpdateAppConfig(form);
      setConfig(form);
      setDirty(false);
      addToast('Đã lưu cài đặt', 'success');
    } catch (e: any) {
      addToast('Lỗi lưu: ' + String(e), 'error');
    }
  };

  const selectDir = async (key: keyof AppConfig) => {
    try {
      const dir = await wailsApi.SelectDirectory();
      if (dir) updateField(key, dir);
    } catch {}
  };

  return (
    <div className="mb-3 shrink-0">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-gray-300 hover:border-gray-700 transition-colors"
      >
        <Settings2 size={14} />
        <span className="font-medium">Cài đặt tạo video</span>
        <span className="text-xs text-gray-600 ml-1">
          {form.model === 'veo_3_1_fast' ? 'Veo 3.1 Fast' : form.model} &middot; {form.aspect_ratio === '16:9' ? 'Landscape' : 'Portrait'} &middot; x{form.output_count}
        </span>
        <div className="flex-1" />
        {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showSettings && (
        <div className="mt-2 bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Model</label>
              <select value={form.model} onChange={(e) => updateField('model', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="veo_3_1_fast">Veo 3.1 Fast (Ultra)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tỷ lệ khung hình</label>
              <select value={form.aspect_ratio} onChange={(e) => updateField('aspect_ratio', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Số lượng output</label>
              <select value={form.output_count} onChange={(e) => updateField('output_count', parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value={1}>x1</option>
                <option value={2}>x2</option>
                <option value={3}>x3</option>
                <option value={4}>x4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Thư mục tải xuống</label>
            <div className="flex gap-1">
              <input value={form.download_dir} onChange={(e) => updateField('download_dir', e.target.value)} className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              <button onClick={() => selectDir('download_dir')} className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded shrink-0"><FolderOpen size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Thử lại tối đa</label>
              <input type="number" value={form.max_retries} onChange={(e) => updateField('max_retries', parseInt(e.target.value) || 1)} min={0} max={10} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Độ trễ tối thiểu (giây)</label>
              <input type="number" value={form.min_delay_seconds} onChange={(e) => updateField('min_delay_seconds', parseInt(e.target.value) || 5)} min={1} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Độ trễ tối đa (giây)</label>
              <input type="number" value={form.max_delay_seconds} onChange={(e) => updateField('max_delay_seconds', parseInt(e.target.value) || 15)} min={3} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {dirty && (
            <button onClick={saveSettings} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors">
              <Save size={14} /> Lưu cài đặt
            </button>
          )}
        </div>
      )}
    </div>
  );
}
