import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initAnnouncer,
  announce,
  announcePolite,
  announceAssertive,
  clearAnnouncements,
} from './live-announcer';

describe('Live Announcer', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = initAnnouncer();
  });

  afterEach(() => {
    cleanup();
  });

  it('should create live regions on init', () => {
    const politeRegion = document.getElementById('a11ykit-announcer-polite');
    const assertiveRegion = document.getElementById('a11ykit-announcer-assertive');

    expect(politeRegion).not.toBeNull();
    expect(assertiveRegion).not.toBeNull();
  });

  it('should have correct ARIA attributes', () => {
    const politeRegion = document.getElementById('a11ykit-announcer-polite');

    expect(politeRegion?.getAttribute('aria-live')).toBe('polite');
    expect(politeRegion?.getAttribute('aria-atomic')).toBe('true');
    expect(politeRegion?.getAttribute('role')).toBe('status');
  });

  it('should announce polite messages', async () => {
    announcePolite('Test message');

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const politeRegion = document.getElementById('a11ykit-announcer-polite');
    expect(politeRegion?.textContent).toBe('Test message');
  });

  it('should announce assertive messages', async () => {
    announceAssertive('Urgent message');

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const assertiveRegion = document.getElementById('a11ykit-announcer-assertive');
    expect(assertiveRegion?.textContent).toBe('Urgent message');
  });

  it('should clear announcements', async () => {
    announcePolite('Test message');
    await new Promise((resolve) => requestAnimationFrame(resolve));

    clearAnnouncements();

    const politeRegion = document.getElementById('a11ykit-announcer-polite');
    expect(politeRegion?.textContent).toBe('');
  });

  it('should remove regions on cleanup', () => {
    cleanup();

    const politeRegion = document.getElementById('a11ykit-announcer-polite');
    const assertiveRegion = document.getElementById('a11ykit-announcer-assertive');

    expect(politeRegion).toBeNull();
    expect(assertiveRegion).toBeNull();
  });
});
