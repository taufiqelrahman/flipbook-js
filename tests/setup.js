// Test setup file
import { beforeEach, afterEach, vi } from 'vitest';

// Mock Modernizr
global.Modernizr = {
  csstransforms3d: true,
  preserve3d: true,
};

// Clean up after each test
afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});
