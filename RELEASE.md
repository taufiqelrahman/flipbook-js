# Publishing to npm

## Quick Release (Recommended)

```bash
./release.sh patch   # Bug fixes (1.1.1 → 1.1.2)
./release.sh minor   # New features (1.1.1 → 1.2.0)
./release.sh major   # Breaking changes (1.1.1 → 2.0.0)
```

**What it does:**
1. ✓ Lint code
2. ✓ Run all tests
3. ✓ Build & minify
4. ✓ Bump version & create git tag
5. ✓ Push to GitHub
6. ✓ Publish to npm

---

## Manual Steps

### 1. Pre-Release Check
```bash
./prerelease-check.sh
```

### 2. Update Changelog (Optional)
```bash
./update-changelog.sh
git commit -am "docs: update changelog"
```

### 3. Version Bump
```bash
npm version patch  # or minor/major
```

### 4. Publish
```bash
./publish-npm.sh
git push --tags
```

---

## Troubleshooting

### Undo Version Bump
```bash
git tag -d v1.1.2
git reset --hard HEAD~1
```

### Check Package Contents
```bash
npm pack --dry-run
```

### Verify npm Login
```bash
npm whoami
```

---

## Files Published

Only these files go to npm (~6.4 KB total):
- `dist/flipbook.umd.min.js`
- `dist/flipbook.esm.min.js`
- `dist/flipbook.min.css`
- `dist/flipbook.d.ts`
- `package.json`
- `README.md`

**NOT included:** `src/`, `tests/`, `demo/`, dev configs, scripts

---

## Available Commands

```bash
# Testing
pnpm test:all        # Run all tests
pnpm test:unit       # Unit tests only
pnpm test:e2e        # E2E tests only

# Building
pnpm clean           # Clean dist
pnpm build           # Full build
pnpm demo            # Update demo files

# Releasing
./release.sh patch   # Complete release
./prerelease-check.sh # Validation only
./publish-npm.sh     # npm publish only
```

---

## Semantic Versioning

- **PATCH** (0.0.x): Bug fixes
- **MINOR** (0.x.0): New features (backwards compatible)
- **MAJOR** (x.0.0): Breaking changes

---

**Links:**
- npm: https://www.npmjs.com/package/flipbook-js
- GitHub: https://github.com/taufiqelrahman/flipbook-js
