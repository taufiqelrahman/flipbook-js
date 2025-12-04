#!/bin/bash

# FlipBook.js Release Script
# This script handles the complete release process: lint, test, build, version, and publish

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if release type is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Release type not specified${NC}"
    echo ""
    echo "Usage: ./release.sh [patch|minor|major]"
    echo ""
    echo "  patch - Bug fixes (1.0.0 -> 1.0.1)"
    echo "  minor - New features (1.0.0 -> 1.1.0)"
    echo "  major - Breaking changes (1.0.0 -> 2.0.0)"
    exit 1
fi

RELEASE_TYPE=$1

if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_error "Invalid release type: $RELEASE_TYPE"
    echo "Use: patch, minor, or major"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   FlipBook.js Release Process          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_step "Current version: ${GREEN}v$CURRENT_VERSION${NC}"
echo ""

# Confirm release
read -p "$(echo -e ${YELLOW}Are you sure you want to release a $RELEASE_TYPE version? [y/N]: ${NC})" -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Release cancelled"
    exit 0
fi

echo ""
print_step "Step 1/8: Checking git status..."
if [[ -n $(git status -s) ]]; then
    print_warning "Working directory has uncommitted changes"
    git status -s
    echo ""
    read -p "$(echo -e ${YELLOW}Do you want to continue anyway? [y/N]: ${NC})" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Release cancelled"
        exit 1
    fi
else
    print_success "Working directory is clean"
fi

echo ""
print_step "Step 2/8: Cleaning dist directory..."
pnpm clean
print_success "Dist directory cleaned"

echo ""
print_step "Step 3/8: Running linter..."
if pnpm lint:check; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

echo ""
print_step "Step 4/8: Running unit tests..."
if pnpm test:unit; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

echo ""
print_step "Step 5/8: Running E2E tests..."
if pnpm test:e2e; then
    print_success "E2E tests passed"
else
    print_error "E2E tests failed"
    exit 1
fi

echo ""
print_step "Step 6/9: Building project..."
if pnpm build; then
    print_success "Build completed"
else
    print_error "Build failed"
    exit 1
fi

echo ""
print_step "Step 7/9: Verifying demo files sync..."
if pnpm verify:demo; then
    print_success "Demo files verified"
else
    print_error "Demo files out of sync"
    exit 1
fi

echo ""
print_step "Step 8/9: Bumping version and creating git tag..."
npm version $RELEASE_TYPE -m "chore: release v%s"
NEW_VERSION=$(node -p "require('./package.json').version")
print_success "Version bumped: ${GREEN}v$CURRENT_VERSION${NC} → ${GREEN}v$NEW_VERSION${NC}"

echo ""
print_step "Step 9/9: Publishing to npm..."

# Verify files that will be published
echo ""
print_step "Files to be published:"
npm pack --dry-run 2>&1 | grep -E "^\s+(dist|package\.json)" || true
echo ""

read -p "$(echo -e ${YELLOW}Ready to publish v$NEW_VERSION to npm? [y/N]: ${NC})" -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Publish cancelled (version tag created locally)"
    print_warning "To undo version bump: git tag -d v$NEW_VERSION && git reset --hard HEAD~1"
    exit 0
fi

# Push to git
print_step "Pushing to git repository..."
git push
git push --tags
print_success "Pushed to git repository"

# Publish to npm
print_step "Publishing to npm..."
if npm publish; then
    print_success "Published to npm successfully!"
else
    print_error "npm publish failed"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   🎉 Release Complete! 🎉              ║"
echo "╚════════════════════════════════════════╝"
echo ""
print_success "Version ${GREEN}v$NEW_VERSION${NC} has been published to npm"
print_success "Repository: https://www.npmjs.com/package/flipbook-js"
print_success "Git tag: v$NEW_VERSION"
echo ""
print_step "Next steps:"
echo "  1. Update CHANGELOG.md with release notes"
echo "  2. Create GitHub release at: https://github.com/taufiqelrahman/flipbook-js/releases/new?tag=v$NEW_VERSION"
echo ""
