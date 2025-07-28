#!/bin/bash

# Script: remove-env-filter-branch.sh
# Purpose: Remove .env files from git history using git filter-branch
# Alternative to BFG method - built into git, but slower

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="git-backup-filter-$(date +%Y%m%d-%H%M%S)"
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")

# Functions
print_header() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if in git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository!"
        exit 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_error "You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
    
    print_success "All prerequisites met"
}

create_backup() {
    print_header "Creating Backup"
    
    echo "Creating backup in $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    
    # Clone the repository as backup
    git clone --mirror . "$BACKUP_DIR/$REPO_NAME.git"
    
    # Backup .env files
    mkdir -p "$BACKUP_DIR/env-files"
    
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            dir=$(dirname "$file")
            mkdir -p "$BACKUP_DIR/env-files/$dir"
            cp "$file" "$BACKUP_DIR/env-files/$file"
            print_success "Backed up: $file"
        fi
    done < <(find . -name ".env*" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -not -name "*.example" -print0)
    
    print_success "Backup created in $BACKUP_DIR"
}

run_filter_branch() {
    print_header "Running git filter-branch"
    
    echo -e "${YELLOW}This process may take a while for large repositories...${NC}"
    echo "Removing .env files from all commits..."
    
    # Remove .env files from all commits
    git filter-branch --force --index-filter '
        git rm --cached --ignore-unmatch .env \
            "**/.env" \
            ".env.local" \
            "**/.env.local" \
            ".env.production" \
            "**/.env.production" \
            ".env.development" \
            "**/.env.development" \
            ".env.staging" \
            "**/.env.staging" \
            ".env.test" \
            "**/.env.test" \
            2>/dev/null || true
    ' --prune-empty --tag-name-filter cat -- --all
    
    print_success "filter-branch completed"
}

cleanup_refs() {
    print_header "Cleaning up references"
    
    # Remove original refs left by filter-branch
    git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
    
    # Expire reflog
    git reflog expire --expire=now --all
    
    # Garbage collection
    git gc --prune=now --aggressive
    
    print_success "Cleanup completed"
}

verify_cleanup() {
    print_header "Verifying cleanup"
    
    echo "Checking for .env files in history..."
    if git log --all --name-only --pretty=format: | sort -u | grep -E "(^|/)\.env($|\.)" | grep -v example > /dev/null 2>&1; then
        print_warning "Some .env references may still exist in history"
        echo "Files found:"
        git log --all --name-only --pretty=format: | sort -u | grep -E "(^|/)\.env($|\.)" | grep -v example || true
    else
        print_success "No .env files found in history (excluding examples)"
    fi
}

create_recovery_script() {
    cat > "$BACKUP_DIR/recover.sh" << 'EOF'
#!/bin/bash
# Recovery script - run from the repository root

echo "Recovering from backup..."

# Remove current .git directory
rm -rf .git

# Copy backup
cp -r "$(dirname "$0")"/*.git .git

# Reset working directory
git reset --hard HEAD

echo "Recovery complete!"
EOF
    
    chmod +x "$BACKUP_DIR/recover.sh"
    print_success "Recovery script created"
}

# Main execution
main() {
    print_header "Git History Cleanup - Using filter-branch"
    
    echo -e "${YELLOW}This will remove all .env files from git history.${NC}"
    echo -e "${YELLOW}This method is slower than BFG but doesn't require Java.${NC}\n"
    
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Aborted by user"
        exit 1
    fi
    
    # Run all steps
    check_prerequisites
    create_backup
    create_recovery_script
    run_filter_branch
    cleanup_refs
    verify_cleanup
    
    print_header "Next Steps"
    
    echo -e "${GREEN}Local cleanup completed!${NC}\n"
    echo "1. Force push to remote:"
    echo "   git push origin --force --all"
    echo "   git push origin --force --tags"
    echo ""
    echo "2. All team members must delete and re-clone"
    echo ""
    echo "3. Rotate all secrets that were in .env files"
    echo ""
    echo -e "${YELLOW}Backup location: $BACKUP_DIR${NC}"
    echo -e "${YELLOW}Recovery script: $BACKUP_DIR/recover.sh${NC}"
}

# Run main function
main