#!/bin/bash

# FlipBook.js Demo Verification Script
# Ensures demo files are in sync with latest build artifacts

set -e

# Colors for output
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

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Demo Files Verification              ║"
echo "╚════════════════════════════════════════╝"
echo ""

DIST_DIR="dist"
DEMO_DIR="demo"
ERRORS=0

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    print_error "Dist directory not found. Run 'pnpm build' first."
    exit 1
fi

# Check if demo directory exists
if [ ! -d "$DEMO_DIR" ]; then
    print_error "Demo directory not found."
    exit 1
fi

print_step "Checking demo files synchronization..."
echo ""

# Check UMD JS file
print_step "Verifying flipbook.umd.min.js..."
if [ ! -f "$DIST_DIR/flipbook.umd.min.js" ]; then
    print_error "Source file $DIST_DIR/flipbook.umd.min.js not found"
    ERRORS=$((ERRORS + 1))
elif [ ! -f "$DEMO_DIR/flipbook.umd.min.js" ]; then
    print_error "Demo file $DEMO_DIR/flipbook.umd.min.js not found"
    ERRORS=$((ERRORS + 1))
else
    DIST_SIZE=$(wc -c < "$DIST_DIR/flipbook.umd.min.js" | tr -d ' ')
    DEMO_SIZE=$(wc -c < "$DEMO_DIR/flipbook.umd.min.js" | tr -d ' ')
    
    if [ "$DIST_SIZE" -eq "$DEMO_SIZE" ]; then
        print_success "UMD JS file is in sync (${DIST_SIZE} bytes)"
    else
        print_error "UMD JS file size mismatch!"
        echo "  Dist: ${DIST_SIZE} bytes"
        echo "  Demo: ${DEMO_SIZE} bytes"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check CSS file
print_step "Verifying flipbook.min.css..."
if [ ! -f "$DIST_DIR/flipbook.min.css" ]; then
    print_error "Source file $DIST_DIR/flipbook.min.css not found"
    ERRORS=$((ERRORS + 1))
elif [ ! -f "$DEMO_DIR/flipbook.min.css" ]; then
    print_error "Demo file $DEMO_DIR/flipbook.min.css not found"
    ERRORS=$((ERRORS + 1))
else
    DIST_SIZE=$(wc -c < "$DIST_DIR/flipbook.min.css" | tr -d ' ')
    DEMO_SIZE=$(wc -c < "$DEMO_DIR/flipbook.min.css" | tr -d ' ')
    
    if [ "$DIST_SIZE" -eq "$DEMO_SIZE" ]; then
        print_success "CSS file is in sync (${DIST_SIZE} bytes)"
    else
        print_error "CSS file size mismatch!"
        echo "  Dist: ${DIST_SIZE} bytes"
        echo "  Demo: ${DEMO_SIZE} bytes"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check if demo HTML exists
print_step "Verifying demo HTML file..."
if [ ! -f "$DEMO_DIR/index.html" ]; then
    print_error "Demo HTML file not found"
    ERRORS=$((ERRORS + 1))
else
    print_success "Demo HTML file exists"
fi

# Check demo images directory
print_step "Verifying demo images..."
if [ ! -d "$DEMO_DIR/images" ]; then
    print_warning "Demo images directory not found"
else
    IMAGE_COUNT=$(find "$DEMO_DIR/images" -type f \( -name "*.jpg" -o -name "*.png" \) | wc -l | tr -d ' ')
    if [ "$IMAGE_COUNT" -eq 0 ]; then
        print_warning "No images found in demo/images/"
    else
        print_success "Found ${IMAGE_COUNT} demo images"
    fi
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "╔════════════════════════════════════════╗"
    echo "║   ✓ All Demo Files In Sync             ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    print_success "Demo is ready for deployment!"
    exit 0
else
    echo "╔════════════════════════════════════════╗"
    echo "║   ✗ Demo Sync Issues Found             ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    print_error "Found $ERRORS issue(s)"
    print_step "To fix: Run 'pnpm demo' or 'pnpm build'"
    exit 1
fi
