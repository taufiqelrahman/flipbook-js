# Quick Reference

## 🚀 Publish to npm

```bash
./release.sh patch
```

Done! (lint → test → build → verify demo → tag → publish)

---

## 🧪 Testing

```bash
pnpm test:all        # All tests
pnpm test:unit       # Unit only
pnpm test:e2e        # E2E only
```

---

## 🔨 Building

```bash
pnpm build           # Full build
pnpm clean           # Clean dist
pnpm demo            # Update demo
pnpm verify:demo     # Verify demo sync
```

---

## 📋 Manual Release

```bash
./prerelease-check.sh     # 1. Check
npm version patch         # 2. Version
./publish-npm.sh          # 3. Publish
git push --tags           # 4. Push
```

---

## 🔍 Verify

```bash
npm pack --dry-run   # Check package
npm whoami           # Check login
```

---

## 📚 Docs

- Full guide: [RELEASE.md](./RELEASE.md)
- Testing: [TESTING.md](./TESTING.md)
