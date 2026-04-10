/**
 * Typed wrapper for Wails Go backend bindings.
 * Eliminates `(window as any).go.main.App.*` scattered across components.
 */
import type { Task, DashboardStats, AppConfig, BrowserInfo } from '../types';

const app = () => (window as any).go.main.App;

export const wailsApi = {
  // Browser
  LaunchBrowser: (): Promise<void> => app().LaunchBrowser(),
  CloseBrowser: (): Promise<void> => app().CloseBrowser(),
  GetBrowserStatus: (): Promise<string> => app().GetBrowserStatus(),
  GetBrowserInfo: (): Promise<BrowserInfo> => app().GetBrowserInfo(),

  // Tasks
  GetAllTasks: (): Promise<Task[]> => app().GetAllTasks(),
  GetTasksByStatus: (status: string): Promise<Task[]> => app().GetTasksByStatus(status),
  CreateTask: (prompt: string): Promise<Task> => app().CreateTask(prompt),
  DeleteTask: (id: number): Promise<void> => app().DeleteTask(id),
  GetDashboardStats: (): Promise<DashboardStats> => app().GetDashboardStats(),

  // Config
  GetAppConfig: (): Promise<AppConfig> => app().GetAppConfig(),
  UpdateAppConfig: (cfg: AppConfig): Promise<void> => app().UpdateAppConfig(cfg),
  SelectDirectory: (): Promise<string> => app().SelectDirectory(),

  // Queue
  StartQueue: (): Promise<void> => app().StartQueue(),
  PauseQueue: (): Promise<void> => app().PauseQueue(),
  ResumeQueue: (): Promise<void> => app().ResumeQueue(),
  StopQueue: (): Promise<void> => app().StopQueue(),
  GetQueueStatus: (): Promise<string> => app().GetQueueStatus(),
  AddPrompt: (prompt: string): Promise<Task> => app().AddPrompt(prompt),
  AddPromptBatch: (prompts: string[]): Promise<number> => app().AddPromptBatch(prompts),
  ImportPromptsFromFile: (): Promise<number> => app().ImportPromptsFromFile(),
  RequeueTask: (id: number): Promise<void> => app().RequeueTask(id),

  // Utility
  DetectChromePath: (): Promise<string> => app().DetectChromePath(),

  // Selectors
  GetSelectors: (): Promise<Record<string, string>> => app().GetSelectors(),
  UpdateSelector: (name: string, selector: string): Promise<void> => app().UpdateSelector(name, selector),

  // API
  RefreshAPIToken: (): Promise<void> => app().RefreshAPIToken(),
};
