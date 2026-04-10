export type TaskStatus = 'pending' | 'queued' | 'generating' | 'downloading' | 'completed' | 'failed';

export interface Task {
  id: number;
  prompt: string;
  status: TaskStatus;
  video_path: string;
  error_message: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  started_at: string;
  completed_at: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  generating: number;
  completed: number;
  failed: number;
}

export interface AppConfig {
  access_token: string;
  project_id: string;
  min_delay_seconds: number;
  max_delay_seconds: number;
  max_retries: number;
  model: string;
  aspect_ratio: string;
  output_count: number;
}

export type QueueStatus = 'idle' | 'running' | 'paused';
export type Page = 'dashboard' | 'queue' | 'history' | 'settings';
