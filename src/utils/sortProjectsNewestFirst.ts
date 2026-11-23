/**
 * Display real construction projects newest first without changing stored data.
 * Firestore timestamps can reach the UI as Timestamp objects, REST ISO strings,
 * or JSON objects with seconds/nanoseconds.
 * Legacy projects with no createdAt stay behind dated projects.
 */
export function getProjectCreatedAtMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "string") return Date.parse(value) || 0;
  if (typeof value === "number") return value > 1e11 ? value : value * 1000;
  if (typeof value !== "object") return 0;

  const timestamp = value as {
    toMillis?: () => number;
    seconds?: number;
    nanoseconds?: number;
    _seconds?: number;
    _nanoseconds?: number;
  };
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  const seconds = timestamp.seconds ?? timestamp._seconds;
  const nanos = timestamp.nanoseconds ?? timestamp._nanoseconds ?? 0;
  return typeof seconds === "number" ? seconds * 1000 + nanos / 1e6 : 0;
}

export function sortProjectsNewestFirst<T extends { createdAt?: unknown; isSample?: boolean }>(
  projects: T[],
): T[] {
  return [...projects].sort((a, b) => {
    // Keep concept samples after completed real construction projects.
    if (Boolean(a.isSample) !== Boolean(b.isSample)) return a.isSample ? 1 : -1;
    return getProjectCreatedAtMillis(b.createdAt) - getProjectCreatedAtMillis(a.createdAt);
  });
}
