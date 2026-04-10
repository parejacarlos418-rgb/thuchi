import { useEffect, useState } from 'react';
import { Save, Key, Hash, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import * as storage from '../lib/taskStorage';
import type { AppConfig } from '../types';

export function SettingsPage() {
  const { setConfig, addToast } = useAppStore();
  const [form, setForm] = useState<AppConfig | null>(null);

  useEffect(() => {
    setForm(storage.getConfig());
  }, []);

  if (!form) return <p className="text-gray-500">Đang tải...</p>;

  const updateField = (key: keyof AppConfig, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const save = () => {
    storage.saveConfig(form);
    setConfig(form);
    addToast('Đã lưu cài đặt', 'success');
  };

  const hasToken = !!form.access_token;
  const hasProject = !!form.project_id;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <h2 className="text-xl font-semibold text-white">Cài đặt</h2>

      {/* Status */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${
        hasToken && hasProject
          ? 'bg-green-950/30 border-green-800/50 text-green-300'
          : 'bg-yellow-950/30 border-yellow-800/50 text-yellow-300'
      }`}>
        {hasToken && hasProject ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm">
          {hasToken && hasProject
            ? 'Đã cấu hình xong. Sẵn sàng tạo video!'
            : `Cần cấu hình: ${!hasToken ? 'Access Token' : ''}${!hasToken && !hasProject ? ' và ' : ''}${!hasProject ? 'Project ID' : ''}`}
        </span>
      </div>

      {/* Token Section */}
      <section className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Key size={14} /> Access Token (Google)
        </h3>

        <div>
          <textarea
            value={form.access_token}
            onChange={(e) => updateField('access_token', e.target.value.trim())}
            placeholder="Dán access_token ở đây..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono resize-none focus:outline-none focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg text-xs text-blue-300 space-y-2">
          <p className="font-semibold">Cách lấy Access Token:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-400">
            <li>Mở <a href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener" className="underline hover:text-blue-300">labs.google/fx/tools/flow</a> và đăng nhập Google</li>
            <li>Nhấn <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">F12</kbd> mở DevTools &rarr; tab <strong>Console</strong></li>
            <li>Paste lệnh này và nhấn Enter:</li>
          </ol>
          <code className="block bg-gray-800 px-3 py-2 rounded text-green-400 text-xs break-all select-all">
            copy(__NEXT_DATA__.props.pageProps.session.access_token)
          </code>
          <p className="text-gray-500">Token sẽ được copy vào clipboard. Dán vào ô trên.</p>
          <p className="text-yellow-400">&#9888; Token hết hạn sau ~1 giờ. Lấy lại khi hết hạn.</p>
        </div>
      </section>

      {/* Project ID Section */}
      <section className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Hash size={14} /> Project ID
        </h3>

        <input
          value={form.project_id}
          onChange={(e) => updateField('project_id', e.target.value.trim())}
          placeholder="Dán project ID ở đây..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
        />

        <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg text-xs text-blue-300 space-y-2">
          <p className="font-semibold">Cách lấy Project ID:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-400">
            <li>Mở <a href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener" className="underline hover:text-blue-300">labs.google/fx/tools/flow</a></li>
            <li>Tạo hoặc mở một project</li>
            <li>Nhìn URL trên trình duyệt, ví dụ: <code className="bg-gray-700 px-1 rounded">.../flow/project/<strong>ABC123xyz...</strong></code></li>
            <li>Copy phần ID sau <code className="bg-gray-700 px-1 rounded">/project/</code></li>
          </ol>
        </div>
      </section>

      {/* Generation Settings */}
      <section className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Cài đặt tạo video</h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Model</label>
            <select value={form.model} onChange={(e) => updateField('model', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="veo_3_1_fast">Veo 3.1 Fast (Ultra)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tỷ lệ</label>
            <select value={form.aspect_ratio} onChange={(e) => updateField('aspect_ratio', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="16:9">16:9 Landscape</option>
              <option value="9:16">9:16 Portrait</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Số output</label>
            <select value={form.output_count} onChange={(e) => updateField('output_count', parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value={1}>x1</option>
              <option value={2}>x2</option>
              <option value={3}>x3</option>
              <option value={4}>x4</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Thử lại tối đa</label>
            <input type="number" value={form.max_retries} onChange={(e) => updateField('max_retries', parseInt(e.target.value) || 1)} min={0} max={10} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Delay tối thiểu (s)</label>
            <input type="number" value={form.min_delay_seconds} onChange={(e) => updateField('min_delay_seconds', parseInt(e.target.value) || 5)} min={1} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Delay tối đa (s)</label>
            <input type="number" value={form.max_delay_seconds} onChange={(e) => updateField('max_delay_seconds', parseInt(e.target.value) || 15)} min={3} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </section>

      <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
        <Save size={14} /> Lưu tất cả cài đặt
      </button>
    </div>
  );
}
