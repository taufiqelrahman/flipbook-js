#!/bin/bash

# Simple NPM Publish Script (without git tag creation)
# Use this when you've already created the git tag manually

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
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
echo "║   NPM Publish Only                     ║"
echo "╚════════════════════════════════════════╝"
echo ""

CURRENT_VERSION=$(node -p "require('./package.json').version")
print_step "Current version: ${GREEN}v$CURRENT_VERSION${NC}"
echo ""

# Confirm publish
read -p "$(echo -e ${YELLOW}Publish v$CURRENT_VERSION to npm? [y/N]: ${NC})" -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Publish cancelled"
    exit 0
fi

echo ""
print_step "Step 1/4: Running tests..."
if pnpm test:all; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    exit 1
fi

echo ""
print_step "Step 2/4: Building project..."
if pnpm build; then
    print_success "Build completed"
else
    print_error "Build failed"
    exit 1
fi

echo ""
print_step "Step 3/4: Verifying package contents..."
npm pack --dry-run

echo ""
print_step "Step 4/4: Publishing to npm..."
if npm publish; then
    print_success "Published to npm successfully!"
else
    print_error "npm publish failed"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Published!                        ║"
echo "╚════════════════════════════════════════╝"
echo ""
print_success "Package: https://www.npmjs.com/package/flipbook-js"
print_success "Version: v$CURRENT_VERSION"
echo ""
