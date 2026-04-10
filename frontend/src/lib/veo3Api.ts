/**
 * Google Veo3 API client.
 * Makes calls through Cloudflare Functions proxy to bypass CORS.
 */

const API_BASE = 'https://aisandbox-pa.googleapis.com/v1';

// === Types ===

export interface GenerateResponse {
  media: { name: string }[];
  remainingCredits: number;
}

export interface MediaResult {
  name: string;
  mediaMetadata: {
    mediaStatus: { mediaGenerationStatus: string };
  };
}

export interface StatusResponse {
  media: MediaResult[];
}

// Model constants
const MODEL_VEO31_FAST = 'veo_3_1_t2v_fast_ultra';
const STATUS_COMPLETED = 'MEDIA_GENERATION_STATUS_SUCCESSFUL';
const STATUS_FAILED = 'MEDIA_GENERATION_STATUS_FAILED';

// === Proxy helper ===

async function proxyRequest(url: string, method: string, token: string, body?: any): Promise<any> {
  const resp = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, method, token, body }),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`API ${resp.status}: ${text.substring(0, 200)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// === API Methods ===

export async function generateVideo(
  token: string,
  projectId: string,
  prompt: string,
  model: string,
  aspectRatio: string,
  outputCount: number
): Promise<GenerateResponse> {
  const apiModel = mapModel(model);
  const apiAspect = aspectRatio === '9:16' ? 'VIDEO_ASPECT_RATIO_PORTRAIT' : 'VIDEO_ASPECT_RATIO_LANDSCAPE';

  const count = Math.max(1, Math.min(4, outputCount));
  const requests = Array.from({ length: count }, () => ({
    aspectRatio: apiAspect,
    seed: Math.floor(Math.random() * 10000),
    textInput: { structuredPrompt: { parts: [{ text: prompt }] } },
    videoModelKey: apiModel,
    metadata: {},
  }));

  const body = {
    mediaGenerationContext: { batchId: crypto.randomUUID() },
    clientContext: {
      projectId,
      tool: 'PINHOLE',
      userPaygateTier: 'PAYGATE_TIER_TWO',
      sessionId: `;${Date.now()}`,
      recaptchaContext: { token: '', applicationType: 'RECAPTCHA_APPLICATION_TYPE_WEB' },
    },
    requests,
    useV2ModelConfig: true,
  };

  return proxyRequest(`${API_BASE}/video:batchAsyncGenerateVideoText`, 'POST', token, body);
}

export async function checkStatus(
  token: string,
  projectId: string,
  mediaIds: string[]
): Promise<StatusResponse> {
  const body = {
    media: mediaIds.map((name) => ({ name, projectId })),
  };
  return proxyRequest(`${API_BASE}/video:batchCheckAsyncVideoGenerationStatus`, 'POST', token, body);
}

export async function waitForCompletion(
  token: string,
  projectId: string,
  mediaIds: string[],
  timeoutMs = 5 * 60 * 1000,
  pollIntervalMs = 10000
): Promise<MediaResult[]> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const status = await checkStatus(token, projectId, mediaIds);
    const allDone = status.media.every(
      (m) =>
        m.mediaMetadata.mediaStatus.mediaGenerationStatus === STATUS_COMPLETED ||
        m.mediaMetadata.mediaStatus.mediaGenerationStatus === STATUS_FAILED
    );
    if (allDone) return status.media;
    await sleep(pollIntervalMs);
  }

  throw new Error('Timeout chờ video tạo xong');
}

export function getCompletedMediaIds(results: MediaResult[]): string[] {
  return results
    .filter((m) => m.mediaMetadata.mediaStatus.mediaGenerationStatus === STATUS_COMPLETED)
    .map((m) => m.name);
}

export function getDownloadUrl(mediaId: string): string {
  return `https://labs.google/fx/api/trpc/media.getMediaUrlRedirect?name=${encodeURIComponent(mediaId)}&mediaUrlType=MEDIA_URL_TYPE_UNSPECIFIED`;
}

// === Helpers ===

function mapModel(configModel: string): string {
  const map: Record<string, string> = {
    veo_3_1_fast: MODEL_VEO31_FAST,
    veo_3_1_t2v_fast_ultra: MODEL_VEO31_FAST,
  };
  return map[configModel] || MODEL_VEO31_FAST;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
