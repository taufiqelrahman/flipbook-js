# FlipBook Tests

This directory contains unit tests and E2E tests for the FlipBook library.

## Test Structure

```
tests/
├── setup.js              # Vitest setup file
├── FlipBook.test.js      # Unit tests
└── e2e/
    └── flipbook.spec.js  # E2E tests with Playwright
```

## Running Tests

### Unit Tests
```bash
# Run unit tests in watch mode
pnpm test

# Run unit tests once
pnpm test:unit

# Run with coverage
pnpm test:coverage
```

### E2E Tests
```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

### All Tests
```bash
# Run all tests (unit + E2E)
pnpm test:all
```

## Coverage

The project is configured to maintain minimum 70% code coverage across:
- Lines
- Functions
- Branches
- Statements

Coverage reports are generated in the `coverage/` directory after running `npm run test:coverage`.

## Writing Tests

### Unit Tests
Unit tests use Vitest with jsdom environment for DOM manipulation testing.

Example:
```javascript
import { describe, it, expect } from 'vitest';
import FlipBook from '../src/FlipBook.js';

describe('FlipBook', () => {
  it('should create instance', () => {
    const flipbook = new FlipBook('element-id');
    expect(flipbook).toBeInstanceOf(FlipBook);
  });
});
```

### E2E Tests
E2E tests use Playwright for browser automation testing.

Example:
```javascript
import { test, expect } from '@playwright/test';

test('should load flipbook', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.c-flipbook')).toBeVisible();
});
```

## CI/CD

Tests run automatically on:
- Every pull request
- Every push to master branch

The CI pipeline:
1. Runs linter
2. Runs unit tests
3. Generates coverage report
4. Runs E2E tests on multiple browsers
5. Uploads reports as artifacts
