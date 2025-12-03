#!/bin/bash

# Helper script to add new entry to CHANGELOG.md

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Update CHANGELOG.md                  ║"
echo "╚════════════════════════════════════════╝"
echo ""

print_step "Current version: ${GREEN}v$CURRENT_VERSION${NC}"
echo ""

# Ask for version to document
read -p "$(echo -e ${YELLOW}Enter version to document [$CURRENT_VERSION]: ${NC})" NEW_VERSION
NEW_VERSION=${NEW_VERSION:-$CURRENT_VERSION}

# Get current date
CURRENT_DATE=$(date +%Y-%m-%d)

echo ""
echo "Creating changelog entry for version: ${GREEN}$NEW_VERSION${NC} ($CURRENT_DATE)"
echo ""

# Create temporary file with new entry
TEMP_FILE=$(mktemp)

cat > "$TEMP_FILE" << EOF
## [$NEW_VERSION] - $CURRENT_DATE

### Added
- 

### Fixed
- 

### Changed
- 

### Removed
- 

EOF

# Check if changelog exists
if [ ! -f "CHANGELOG.md" ]; then
    echo "# Changelog" > CHANGELOG.md
    echo "" >> CHANGELOG.md
    echo "All notable changes to this project will be documented in this file." >> CHANGELOG.md
    echo "" >> CHANGELOG.md
fi

# Insert new entry at the top (after header)
if grep -q "^# Changelog" CHANGELOG.md; then
    # Find line number of first ## heading
    LINE_NUM=$(grep -n "^## \[" CHANGELOG.md | head -1 | cut -d: -f1)
    
    if [ -z "$LINE_NUM" ]; then
        # No previous entries, append to end
        cat "$TEMP_FILE" >> CHANGELOG.md
    else
        # Insert before first entry
        head -n $((LINE_NUM - 1)) CHANGELOG.md > "${TEMP_FILE}.tmp"
        cat "$TEMP_FILE" >> "${TEMP_FILE}.tmp"
        echo "" >> "${TEMP_FILE}.tmp"
        tail -n +$LINE_NUM CHANGELOG.md >> "${TEMP_FILE}.tmp"
        mv "${TEMP_FILE}.tmp" CHANGELOG.md
    fi
else
    # No header found, create new file
    echo "# Changelog" > CHANGELOG.md
    echo "" >> CHANGELOG.md
    echo "All notable changes to this project will be documented in this file." >> CHANGELOG.md
    echo "" >> CHANGELOG.md
    cat "$TEMP_FILE" >> CHANGELOG.md
fi

rm -f "$TEMP_FILE"

print_success "Changelog template created for version $NEW_VERSION"
echo ""
print_step "Next steps:"
echo "  1. Edit CHANGELOG.md and fill in the changes"
echo "  2. Remove empty sections (Added/Fixed/Changed/Removed)"
echo "  3. Commit the changes: ${GREEN}git add CHANGELOG.md && git commit -m 'docs: update changelog'${NC}"
echo ""
echo "Opening CHANGELOG.md..."

# Try to open with editor
if command -v code &> /dev/null; then
    code CHANGELOG.md
elif command -v vim &> /dev/null; then
    vim CHANGELOG.md
elif command -v nano &> /dev/null; then
    nano CHANGELOG.md
else
    echo "Please edit CHANGELOG.md manually"
fi
