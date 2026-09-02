/**
 * Formats a duration in seconds into a friendly localized string (e.g. "2h 30m" or "45 min").
 */
export function formatPlayTime(seconds: number): string | null {
  if (seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Formats file size in bytes to a human-readable string (e.g. "1.5 Mo", "5.2 Go").
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats elapsed seconds into an arcade timer string (e.g. "01:45" or "1h 12m 30s").
 */
export function formatElapsedSeconds(sec: number): string {
  const mins = Math.floor(sec / 60);
  const s = sec % 60;
  const hrs = Math.floor(mins / 60);
  const m = mins % 60;
  if (hrs > 0) {
    return `${hrs}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
