#!/bin/bash
set -e

# Store the root directory to avoid pathing issues
ROOT_DIR=$(pwd)

echo "🚀 Publishing compa11y Stable Release to NPM"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if logged into npm
echo "📋 Checking NPM authentication..."
if ! pnpm whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Not logged into NPM. Please run: pnpm login${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Logged in as: $(pnpm whoami)${NC}"
echo ""

# Get current versions from package.json files
CORE_VERSION=$(node -p "require('./packages/core/package.json').version")
REACT_VERSION=$(node -p "require('./packages/react/package.json').version")
WEB_VERSION=$(node -p "require('./packages/web/package.json').version")
A11Y_VERSION=$(node -p "require('./packages/compa11y/package.json').version")

# Confirm before proceeding
echo -e "${YELLOW}⚠️  You are about to publish the following packages as STABLE (latest):${NC}"
echo "   - @compa11y/core@${CORE_VERSION}"
echo "   - @compa11y/react@${REACT_VERSION}"
echo "   - @compa11y/web@${WEB_VERSION}"
echo "   - @compa11y/compa11y@${A11Y_VERSION}"
echo ""
echo -e "${YELLOW}⚠️  This will set these versions as the DEFAULT on npm!${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Build all packages
echo ""
echo "🔨 Building all packages..."
pnpm build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Helper function to publish
publish_pkg() {
    local pkg_path=$1
    local pkg_name=$2

    echo "📦 Publishing $pkg_name..."
    cd "$ROOT_DIR/$pkg_path"

    # Publish with 'latest' tag (this is the default when no tag is specified)
    pnpm publish --access public --no-git-checks

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to publish $pkg_name${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Published $pkg_name${NC}"
    cd "$ROOT_DIR"
}

# Execute Publish sequence
publish_pkg "packages/core" "@compa11y/core"
echo ""
publish_pkg "packages/react" "@compa11y/react"
echo ""
publish_pkg "packages/web" "@compa11y/web"
echo ""
publish_pkg "packages/compa11y" "@compa11y/compa11y"

echo ""
echo -e "${GREEN}✨ All packages published successfully as STABLE!${NC}"
echo ""
echo "📋 What was done:"
echo "   ✓ Published all packages"
echo "   ✓ Automatically set as 'latest' tag (default on npm)"
echo "   ✓ Users running 'npm install @compa11y/web' will get this version"
echo ""
echo "📋 Next steps:"
echo "   1. Tag release: git tag -a v${CORE_VERSION} -m 'Release v${CORE_VERSION}'"
echo "   2. Push tag: git push origin v${CORE_VERSION}"
echo "   3. Verify on npm: https://www.npmjs.com/package/@compa11y/web"
echo ""
echo "🎉 Done!"
