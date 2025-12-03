#!/bin/bash

# FlipBook.js Pre-Release Check Script
# This script runs all checks before releasing (without actually publishing)

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   FlipBook.js Pre-Release Check        ║"
echo "╚════════════════════════════════════════╝"
echo ""

CURRENT_VERSION=$(node -p "require('./package.json').version")
print_step "Current version: ${GREEN}v$CURRENT_VERSION${NC}"
echo ""

print_step "Step 1/6: Checking git status..."
if [[ -n $(git status -s) ]]; then
    print_error "Working directory has uncommitted changes"
    git status -s
    exit 1
else
    print_success "Working directory is clean"
fi

echo ""
print_step "Step 2/6: Cleaning dist directory..."
pnpm clean
print_success "Dist directory cleaned"

echo ""
print_step "Step 3/6: Running linter..."
if pnpm lint:check; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

echo ""
print_step "Step 4/6: Running unit tests..."
if pnpm test:unit; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

echo ""
print_step "Step 5/6: Running E2E tests..."
if pnpm test:e2e; then
    print_success "E2E tests passed"
else
    print_error "E2E tests failed"
    exit 1
fi

echo ""
print_step "Step 6/6: Building project..."
if pnpm build; then
    print_success "Build completed"
else
    print_error "Build failed"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ All Checks Passed!                ║"
echo "╚════════════════════════════════════════╝"
echo ""
print_success "Project is ready for release!"
echo ""
print_step "To release, run:"
echo "  ${GREEN}./release.sh patch${NC}  # for bug fixes (v$CURRENT_VERSION -> v${CURRENT_VERSION%.*}.$((${CURRENT_VERSION##*.}+1)))"
echo "  ${GREEN}./release.sh minor${NC}  # for new features"
echo "  ${GREEN}./release.sh major${NC}  # for breaking changes"
echo ""
