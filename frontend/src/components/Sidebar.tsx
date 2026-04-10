import { LayoutDashboard, ListTodo, History, Settings } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { Page } from '../types';

const navItems: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { page: 'queue', label: 'Hàng đợi', icon: ListTodo },
  { page: 'history', label: 'Lịch sử', icon: History },
  { page: 'settings', label: 'Cài đặt', icon: Settings },
];

export function Sidebar() {
  const { activePage, setPage, queueStatus } = useAppStore();

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white">Veo3 Manager</h1>
        <p className="text-xs text-gray-500">Quản lý tạo video AI</p>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => setPage(page)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              activePage === page
                ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className={`w-2 h-2 rounded-full ${
            queueStatus === 'running' ? 'bg-green-500 animate-pulse' :
            queueStatus === 'paused' ? 'bg-yellow-500' : 'bg-gray-600'
          }`} />
          <span>Queue: {queueStatus === 'running' ? 'Đang chạy' : queueStatus === 'paused' ? 'Tạm dừng' : 'Chờ'}</span>
        </div>
      </div>
    </aside>
  );
}
