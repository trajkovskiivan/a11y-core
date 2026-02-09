#!/bin/bash
set -e

# Store the root directory to avoid pathing issues
ROOT_DIR=$(pwd)

echo "🚀 Publishing a11y-core Alpha Release to NPM"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if logged into npm
echo "📋 Checking NPM authentication..."
# Using pnpm whoami for consistency
if ! pnpm whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Not logged into NPM. Please run: pnpm login${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Logged in as: $(pnpm whoami)${NC}"
echo ""

# Confirm before proceeding
echo -e "${YELLOW}⚠️  You are about to publish the following packages:${NC}"
echo "   - @a11y-core/core@0.1.0-alpha.2"
echo "   - @a11y-core/react@0.1.0-alpha.2"
echo "   - @a11y-core/web@0.1.0-alpha.2"
echo "   - @a11y-core/a11y-core@0.1.0-alpha.2"
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

# Build check (set -e handles this, but explicit is better)
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
    
    # We use pnpm publish to handle 'workspace:*' conversion
    # --no-git-checks allows publishing even if the local git state isn't perfectly clean
    pnpm publish --access public --tag alpha --no-git-checks
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to publish $pkg_name${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Published $pkg_name${NC}"
    cd "$ROOT_DIR"
}

# Execute Publish sequence
publish_pkg "packages/core" "@a11y-core/core"
echo ""
publish_pkg "packages/react" "@a11y-core/react"
echo ""
publish_pkg "packages/web" "@a11y-core/web"
echo ""
publish_pkg "packages/a11y-core" "@a11y-core/a11y-core"

echo ""
echo -e "${GREEN}✨ All packages published successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Tag release: git tag -a v0.1.0-alpha.0 -m 'Alpha release v0.1.0-alpha.0'"
echo "   2. Push tag: git push origin v0.1.0-alpha.0"
echo "   3. Test installation: pnpm add @a11y-core/react@alpha"
echo ""
echo "🎉 Done!"