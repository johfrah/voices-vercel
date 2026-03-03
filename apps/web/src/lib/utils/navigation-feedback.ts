export const NAVIGATION_FEEDBACK_START_EVENT = 'voices:navigation-feedback:start';

export function emitNavigationFeedbackStart() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NAVIGATION_FEEDBACK_START_EVENT));
}
