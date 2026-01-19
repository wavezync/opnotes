#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

usage() {
    echo -e "${BLUE}Usage:${NC} $0 <bump-type> [channel]"
    echo ""
    echo -e "${BLUE}Bump types:${NC}"
    echo "  major    - Bump major version (1.0.0 -> 2.0.0)"
    echo "  minor    - Bump minor version (1.0.0 -> 1.1.0)"
    echo "  patch    - Bump patch version (1.0.0 -> 1.0.1)"
    echo ""
    echo -e "${BLUE}Channels (optional):${NC}"
    echo "  alpha    - Add -alpha suffix"
    echo "  beta     - Add -beta suffix"
    echo "  stable   - Remove any channel suffix (default if omitted)"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 minor alpha    # 1.0.0 -> 1.1.0-alpha"
    echo "  $0 patch beta     # 1.1.0-alpha -> 1.1.1-beta"
    echo "  $0 major          # 1.1.1-beta -> 2.0.0"
    echo "  $0 patch stable   # 1.0.0-alpha -> 1.0.1"
    exit 1
}

# Validate arguments
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    usage
fi

BUMP_TYPE=$1
CHANNEL=${2:-stable}

if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo -e "${RED}Error:${NC} Invalid bump type '$BUMP_TYPE'"
    usage
fi

if [[ ! "$CHANNEL" =~ ^(alpha|beta|stable)$ ]]; then
    echo -e "${RED}Error:${NC} Invalid channel '$CHANNEL'"
    usage
fi

# Change to project root
cd "$PROJECT_ROOT"

# Check for uncommitted changes (excluding package.json since we'll modify it)
if [ -n "$(git status --porcelain | grep -v 'package.json')" ]; then
    echo -e "${RED}Error:${NC} You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version:${NC} $CURRENT_VERSION"

# Parse current version (strip any existing channel suffix)
BASE_VERSION=$(echo "$CURRENT_VERSION" | sed -E 's/-(alpha|beta)$//')
IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE_VERSION"

# Bump version based on type
case $BUMP_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

# Construct new version
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
if [ "$CHANNEL" != "stable" ]; then
    NEW_VERSION="$NEW_VERSION-$CHANNEL"
fi

echo -e "${BLUE}New version:${NC} $NEW_VERSION"

# Confirm with user
echo ""
read -p "Proceed with release v$NEW_VERSION? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Aborted.${NC}"
    exit 0
fi

# Update package.json
echo -e "${BLUE}Updating package.json...${NC}"
node -e "
const fs = require('fs');
const pkg = require('./package.json');
pkg.version = '$NEW_VERSION';
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Commit changes
echo -e "${BLUE}Committing changes...${NC}"
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create tag
TAG_NAME="v$NEW_VERSION"
echo -e "${BLUE}Creating tag ${TAG_NAME}...${NC}"
git tag "$TAG_NAME"

# Push commit and tag
echo -e "${BLUE}Pushing to remote...${NC}"
git push
git push origin "$TAG_NAME"

echo ""
echo -e "${GREEN}✓ Released $TAG_NAME successfully!${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  Version: $CURRENT_VERSION -> $NEW_VERSION"
echo "  Tag: $TAG_NAME"
echo "  Branch: $(git branch --show-current)"
