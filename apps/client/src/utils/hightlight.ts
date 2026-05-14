import { SCROLL_CONFIG } from './consts/scroll';

export const highlightMessage = (el: HTMLElement) => {
  el.scrollIntoView({ behavior: 'auto', block: 'center' });
  el.classList.add('highlight-message');
  setTimeout(() => el.classList.remove('highlight-message'), SCROLL_CONFIG.HIGHLIGHT_DURATION_MS);
};
