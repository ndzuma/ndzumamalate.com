/** @typedef {{ id: number, message: string, type: 'success' | 'error' | 'info', duration: number }} Toast */

let nextId = 0;

/** @type {Toast[]} */
let toasts = $state([]);

export function getToasts() {
  return toasts;
}

/**
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [type='success']
 * @param {number} [duration=2800]
 */
export function toast(message, type = 'success', duration = 2800) {
  const id = nextId++;
  toasts = [...toasts, { id, message, type, duration }];
  setTimeout(() => {
    dismiss(id);
  }, duration);
}

export function dismiss(id) {
  toasts = toasts.filter(t => t.id !== id);
}
