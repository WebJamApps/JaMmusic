import { config } from 'dotenv';
import { vi } from 'vitest';

config();

vi.useFakeTimers({
  now: 1483228800000,
  toFake: ['Date'],
});

vi.mock('@mui/material');
vi.mock('@mui/x-data-grid');
vi.mock('@mui/x-date-pickers');
vi.mock('@react-oauth/google');
vi.mock('socketcluster-client');

global.ResizeObserver = class {
  observe(): void { /* no-op */ }
  unobserve(): void { /* no-op */ }
  disconnect(): void { /* no-op */ }
} as unknown as typeof ResizeObserver;

window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

document.body.innerHTML = '<div id="root"><div id="mAndP"></div><div id="play-buttons">'
  + '</div><div id="share-buttons"></div><div id="googleMap"></div></div>';
window.HTMLMediaElement.prototype.load = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ };

Object.defineProperty(window, 'location', {
  configurable: true,
  writable: true,
  value: {
    href: 'https://web-jam.com',
    origin: 'https://web-jam.com',
    assign: vi.fn(),
    reload: vi.fn(),
  },
});

(globalThis as unknown as { jest: typeof vi }).jest = vi;
