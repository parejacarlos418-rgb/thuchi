import type { BrowserStatus } from '../types';

/** Browser status labels used in Sidebar and SettingsPage. */
export const BROWSER_STATUS_LABELS: Record<BrowserStatus, string> = {
  connected: 'Đã kết nối',
  launching: 'Đang khởi động...',
  disconnected: 'Chưa kết nối',
  error: 'Lỗi',
};
