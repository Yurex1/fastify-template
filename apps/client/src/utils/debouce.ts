let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function debounce(callback: () => void, delayMs: number = 300) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    callback();
  }, delayMs);
}
