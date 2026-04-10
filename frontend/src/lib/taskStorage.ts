/**
 * localStorage-based task storage.
 * Replaces Go SQLite backend for Cloudflare Pages deployment.
 */
import type { Task, TaskStatus, DashboardStats, AppConfig } from '../types';

const TASKS_KEY = 'veo3_tasks';
const CONFIG_KEY = 'veo3_config';

let nextId = Date.now();

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// === Task CRUD ===

export function getAllTasks(): Task[] {
  return loadTasks().sort((a, b) => b.id - a.id);
}

export function getTaskById(id: number): Task | undefined {
  return loadTasks().find((t) => t.id === id);
}

export function createTask(prompt: string): Task {
  const tasks = loadTasks();
  const task: Task = {
    id: ++nextId,
    prompt,
    status: 'pending',
    video_path: '',
    error_message: '',
    retry_count: 0,
    max_retries: 3,
    created_at: new Date().toISOString(),
    started_at: '',
    completed_at: '',
  };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

export function updateTask(id: number, updates: Partial<Task>): Task | null {
  const tasks = loadTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  tasks[idx] = { ...tasks[idx], ...updates };
  saveTasks(tasks);
  return tasks[idx];
}

export function deleteTask(id: number) {
  const tasks = loadTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
}

export function getNextPending(): Task | null {
  const tasks = loadTasks()
    .filter((t) => t.status === 'pending')
    .sort((a, b) => a.id - b.id);
  return tasks[0] || null;
}

export function getStats(): DashboardStats {
  const tasks = loadTasks();
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending' || t.status === 'queued').length,
    generating: tasks.filter((t) => t.status === 'generating' || t.status === 'downloading').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  };
}

export function requeueTask(id: number): Task | null {
  return updateTask(id, {
    status: 'pending',
    retry_count: 0,
    error_message: '',
    started_at: '',
    completed_at: '',
  });
}

// === Config ===

export function getDefaultConfig(): AppConfig {
  return {
    access_token: '',
    project_id: '',
    min_delay_seconds: 5,
    max_delay_seconds: 15,
    max_retries: 3,
    model: 'veo_3_1_fast',
    aspect_ratio: '16:9',
    output_count: 2,
  };
}

export function getConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return { ...getDefaultConfig(), ...JSON.parse(raw) };
  } catch {}
  return getDefaultConfig();
}

export function saveConfig(config: AppConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
