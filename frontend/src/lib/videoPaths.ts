/** Parse video_path field which can be a JSON array or a single URL string. */
export function parseVideoPaths(videoPath: string): string[] {
  if (!videoPath) return [];
  // Try JSON array first (new format)
  if (videoPath.startsWith('[')) {
    try {
      const arr = JSON.parse(videoPath);
      if (Array.isArray(arr)) return arr.filter(Boolean);
    } catch {}
  }
  // Single URL
  return [videoPath];
}
