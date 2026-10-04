export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
    }
  } catch (err) {
    // Sandboxed iframes block localStorage access
  }
  return defaultValue;
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    // Ignore storage denial
  }
}
