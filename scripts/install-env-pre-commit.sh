#!/bin/bash

# Script: install-env-pre-commit.sh
# Purpose: Install a pre-commit hook to prevent .env file commits

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Installing pre-commit hook to prevent .env commits...${NC}"

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create the pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook to prevent committing .env files

# Find .env files in staged changes
env_files=$(git diff --cached --name-only | grep -E "(^|/)\.env($|\.)" | grep -v -E "\.(example|sample)$" || true)

if [ -n "$env_files" ]; then
    echo "❌ ERROR: Attempting to commit .env file(s):"
    echo "$env_files" | sed 's/^/  - /'
    echo ""
    echo "🔒 .env files contain sensitive information and should not be committed."
    echo ""
    echo "To fix this:"
    echo "1. Remove the file(s) from staging: git reset HEAD <file>"
    echo "2. Add the file(s) to .gitignore"
    echo "3. Use .env.example for template files"
    echo ""
    echo "If you really need to commit this (NOT RECOMMENDED), use: git commit --no-verify"
    exit 1
fi

# Also check for common secret patterns in any file
secret_patterns="password=|api_key=|secret=|private_key=|token="
suspicious_files=$(git diff --cached --name-only -z | xargs -0 grep -l -i -E "$secret_patterns" 2>/dev/null || true)

# Exclude known safe files
safe_files=".env.example|.env.sample|README|.md$|test/|spec/|__tests__/"
suspicious_files=$(echo "$suspicious_files" | grep -v -E "$safe_files" || true)

if [ -n "$suspicious_files" ]; then
    echo "⚠️  WARNING: Possible secrets detected in:"
    echo "$suspicious_files" | sed 's/^/  - /'
    echo ""
    echo "Please review these files before committing."
    echo "Press Enter to continue or Ctrl+C to cancel..."
    read -r
fi

exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo -e "${GREEN}✓ Pre-commit hook installed successfully!${NC}"
echo ""
echo "The hook will:"
echo "  - Block commits containing .env files"
echo "  - Warn about files containing potential secrets"
echo ""
echo "To test the hook:"
echo "  1. Create a test .env file"
echo "  2. Try to git add and commit it"
echo "  3. The commit should be blocked"