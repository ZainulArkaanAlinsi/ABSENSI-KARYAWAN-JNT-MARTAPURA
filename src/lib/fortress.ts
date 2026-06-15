/**
 * "The Fortress" - Stability & Reliability Protocols for JNE Admin Web.
 * Implements Exponential Backoff Retries and Graceful Error Handling.
 */

interface RetryOptions {
  maxRetries?: number;
  taskName?: string;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Wraps an async function with exponential backoff retry logic.
 */
export async function fortressRetry<T>(
  action: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 3, taskName = 'Action', onRetry } = options;
  let attempt = 0;

  while (true) {
    try {
      return await action();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        console.error(`[Fortress] ${taskName} failed after ${maxRetries} attempts:`, error);
        throw error;
      }

      const delay = attempt * attempt * 1000; // 1s, 4s, 9s...
      console.warn(
        `[Fortress] ${taskName} attempt ${attempt} failed. Retrying in ${delay}ms...`,
        error,
      );

      if (onRetry) onRetry(attempt, error);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Safe Image Loader with Fallback
 */
export const getSafeImageUrl = (url?: string, fallback = '/placeholder-user.png') => {
  if (!url || url.trim() === '') return fallback;
  // If it's a firebase storage URL, we could potentially append optimization params here
  return url;
};
