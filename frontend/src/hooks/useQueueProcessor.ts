/**
 * Browser-based queue processor.
 * Replaces Go queue worker for Cloudflare Pages deployment.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import * as storage from '../lib/taskStorage';
import * as veo3 from '../lib/veo3Api';

export function useQueueProcessor() {
  const { queueStatus, setQueueStatus, setQueueProgress, setTasks, setStats, addToast, config } =
    useAppStore();
  const processingRef = useRef(false);
  const statusRef = useRef(queueStatus);
  statusRef.current = queueStatus;

  const refreshData = useCallback(() => {
    setTasks(storage.getAllTasks());
    setStats(storage.getStats());
  }, [setTasks, setStats]);

  const processNextTask = useCallback(async () => {
    if (processingRef.current || statusRef.current !== 'running') return;

    const cfg = config || storage.getConfig();
    if (!cfg.access_token || !cfg.project_id) {
      setQueueProgress({ step: 'error', detail: 'Chưa cấu hình token hoặc project ID. Vào Cài đặt để thiết lập.' });
      setQueueStatus('idle');
      return;
    }

    const task = storage.getNextPending();
    if (!task) {
      setQueueProgress({ step: 'completed', detail: 'Hàng đợi đã xử lý xong!' });
      setQueueStatus('idle');
      return;
    }

    processingRef.current = true;
    const promptShort = task.prompt.length > 40 ? task.prompt.substring(0, 40) + '...' : task.prompt;

    try {
      // Step 1: Generate
      setQueueProgress({ step: 'generating', detail: `Đang gửi prompt: ${promptShort}` });
      storage.updateTask(task.id, { status: 'generating', started_at: new Date().toISOString() });
      refreshData();

      const genResp = await veo3.generateVideo(
        cfg.access_token,
        cfg.project_id,
        task.prompt,
        cfg.model,
        cfg.aspect_ratio,
        cfg.output_count
      );

      const mediaIds = genResp.media?.map((m) => m.name) || [];
      if (mediaIds.length === 0) {
        throw new Error('Không nhận được media ID từ API');
      }

      // Step 2: Poll for completion
      setQueueProgress({
        step: 'polling',
        detail: `Đang chờ AI tạo video (${mediaIds.length} output)... Credits: ${genResp.remainingCredits}`,
      });

      const results = await veo3.waitForCompletion(cfg.access_token, cfg.project_id, mediaIds);
      const completed = veo3.getCompletedMediaIds(results);

      if (completed.length === 0) {
        throw new Error('Tất cả video tạo thất bại');
      }

      // Step 3: Save download URLs
      const downloadUrls = completed.map((id) => veo3.getDownloadUrl(id));
      storage.updateTask(task.id, {
        status: 'completed',
        video_path: JSON.stringify(downloadUrls),
        completed_at: new Date().toISOString(),
      });

      setQueueProgress({
        step: 'completed',
        detail: `Hoàn thành! ${completed.length}/${mediaIds.length} video đã sẵn sàng tải`,
      });
      addToast(`Video hoàn thành: ${promptShort}`, 'success');
    } catch (err: any) {
      const errMsg = err.message || String(err);
      const isAuth = errMsg.includes('401') || errMsg.includes('403') || errMsg.includes('unauthorized');

      if (isAuth) {
        setQueueProgress({ step: 'error', detail: 'Token hết hạn. Vào Cài đặt để cập nhật token mới.' });
        storage.updateTask(task.id, { status: 'pending' });
        setQueueStatus('idle');
        addToast('Token hết hạn - cần cập nhật trong Cài đặt', 'error');
      } else if (task.retry_count + 1 >= task.max_retries) {
        storage.updateTask(task.id, {
          status: 'failed',
          error_message: errMsg,
          retry_count: task.retry_count + 1,
        });
        setQueueProgress({ step: 'error', detail: `Thất bại: ${errMsg}` });
        addToast(`Tác vụ thất bại: ${promptShort}`, 'error');
      } else {
        storage.updateTask(task.id, {
          status: 'pending',
          error_message: errMsg,
          retry_count: task.retry_count + 1,
        });
        setQueueProgress({ step: 'error', detail: `Lỗi (thử lại ${task.retry_count + 1}/${task.max_retries}): ${errMsg}` });
      }
    } finally {
      processingRef.current = false;
      refreshData();
    }

    // Delay before next task
    if (statusRef.current === 'running') {
      const delay = cfg.min_delay_seconds + Math.floor(Math.random() * (cfg.max_delay_seconds - cfg.min_delay_seconds + 1));
      setQueueProgress({ step: 'waiting', detail: `Chờ ${delay} giây trước task tiếp theo...` });
      await new Promise((r) => setTimeout(r, delay * 1000));
    }
  }, [config, refreshData, setQueueProgress, setQueueStatus, addToast]);

  // Poll for tasks when queue is running
  useEffect(() => {
    if (queueStatus !== 'running') return;

    const interval = setInterval(() => {
      if (!processingRef.current) processNextTask();
    }, 3000);

    // Start immediately
    processNextTask();

    return () => clearInterval(interval);
  }, [queueStatus, processNextTask]);
}
