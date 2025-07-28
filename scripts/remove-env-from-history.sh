#!/bin/bash

# Script: remove-env-from-history.sh
# Purpose: Safely remove .env files from git history
# Date: $(date +%Y-%m-%d)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="git-backup-$(date +%Y%m%d-%H%M%S)"
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
BFG_VERSION="1.14.0"
BFG_JAR="bfg-${BFG_VERSION}.jar"
BFG_URL="https://repo1.maven.org/maven2/com/madgag/bfg/${BFG_VERSION}/bfg-${BFG_VERSION}.jar"

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
    
    # Check Java for BFG
    if ! command -v java &> /dev/null; then
        print_error "Java is required to run BFG Repo-Cleaner. Please install Java first."
        echo "Visit: https://www.java.com/download/"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

download_bfg() {
    print_header "Downloading BFG Repo-Cleaner"
    
    if [ -f "$BFG_JAR" ]; then
        print_success "BFG already downloaded"
    else
        echo "Downloading BFG v${BFG_VERSION}..."
        if command -v curl &> /dev/null; then
            curl -L -o "$BFG_JAR" "$BFG_URL"
        elif command -v wget &> /dev/null; then
            wget -O "$BFG_JAR" "$BFG_URL"
        else
            print_error "Neither curl nor wget found. Please install one of them."
            exit 1
        fi
        print_success "BFG downloaded successfully"
    fi
}

create_backup() {
    print_header "Creating Backup"
    
    echo "Creating backup in $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    
    # Clone the repository as backup
    git clone --mirror . "$BACKUP_DIR/$REPO_NAME.git"
    
    # Also backup .env files if they exist
    if [ -d "$BACKUP_DIR/env-files" ]; then
        rm -rf "$BACKUP_DIR/env-files"
    fi
    mkdir -p "$BACKUP_DIR/env-files"
    
    # Find and backup all .env files
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            dir=$(dirname "$file")
            mkdir -p "$BACKUP_DIR/env-files/$dir"
            cp "$file" "$BACKUP_DIR/env-files/$file"
            print_success "Backed up: $file"
        fi
    done < <(find . -name ".env*" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -not -name "*.example" -print0)
    
    print_success "Backup created in $BACKUP_DIR"
    echo -e "${YELLOW}Keep this backup until you're sure the cleanup was successful!${NC}"
}

list_env_files_in_history() {
    print_header "Scanning for .env files in git history"
    
    echo "Files that will be removed from history:"
    git log --all --name-only --pretty=format: | sort -u | grep -E "(^|/)\.env($|\.)" | grep -v example || true
    
    echo -e "\n${YELLOW}Note: Only non-example .env files will be removed${NC}"
}

create_env_gitignore() {
    print_header "Creating .env-gitignore file for BFG"
    
    cat > .env-gitignore << 'EOF'
# Remove all .env files except examples
.env
.env.*
!.env.example
!.env.*.example
!.env-example
!.env.sample

# Specific patterns
**/.env
**/.env.local
**/.env.production
**/.env.development
**/.env.staging
**/.env.test
EOF
    
    print_success "Created .env-gitignore file"
}

run_bfg_cleanup() {
    print_header "Running BFG to remove .env files from history"
    
    echo "This will remove all .env files (except examples) from git history..."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Aborted by user"
        exit 1
    fi
    
    # Run BFG
    java -jar "$BFG_JAR" --delete-files "{.env,.env.local,.env.production,.env.development,.env.staging,.env.test}" --no-blob-protection .
    
    # Also remove any .env files in subdirectories
    java -jar "$BFG_JAR" --delete-files "*/.env" --no-blob-protection .
    
    print_success "BFG cleanup completed"
}

cleanup_and_gc() {
    print_header "Running git cleanup and garbage collection"
    
    # Remove BFG backup refs
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    print_success "Git cleanup completed"
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
    
    # Check current working directory
    echo -e "\nChecking working directory..."
    if find . -name ".env*" -not -path "./node_modules/*" -not -path "./$BACKUP_DIR/*" -not -name "*.example" -type f | grep -q .; then
        print_warning ".env files still exist in working directory (this is expected if you have local configs)"
    fi
}

print_next_steps() {
    print_header "Next Steps"
    
    cat << EOF
${GREEN}✓ Local cleanup completed successfully!${NC}

${YELLOW}IMPORTANT: Force push required!${NC}

1. ${BLUE}Review the changes:${NC}
   git log --oneline -10
   
2. ${BLUE}Force push to remote (COORDINATE WITH YOUR TEAM FIRST):${NC}
   git push origin --force --all
   git push origin --force --tags
   
3. ${BLUE}All team members must:${NC}
   a) Back up their local .env files
   b) Delete their local repository
   c) Clone fresh:
      git clone <repository-url>
   d) Restore their .env files
   
4. ${BLUE}Update .gitignore to ensure .env files are ignored:${NC}
   Check that these patterns exist in .gitignore:
   .env
   .env.*
   !.env.example
   !.env.*.example
   
5. ${BLUE}Rotate all secrets that were in .env files${NC}

${RED}⚠ WARNING: Do NOT pull or fetch on existing clones after force push!${NC}

${GREEN}Backup location: $BACKUP_DIR${NC}
Keep this backup until all team members have successfully updated.

${BLUE}Recovery instructions are in: $BACKUP_DIR/RECOVERY.md${NC}
EOF
}

create_recovery_instructions() {
    cat > "$BACKUP_DIR/RECOVERY.md" << EOF
# Recovery Instructions

If something goes wrong, you can restore from backup:

## Option 1: Restore entire repository
\`\`\`bash
# Delete the corrupted repo (BE CAREFUL!)
rm -rf .git

# Copy the backup
cp -r $BACKUP_DIR/$REPO_NAME.git .git

# Reset the repository
git reset --hard HEAD
\`\`\`

## Option 2: Push backup to remote (nuclear option)
\`\`\`bash
cd $BACKUP_DIR/$REPO_NAME.git
git push --mirror <original-remote-url>
\`\`\`

## Restore .env files
All .env files are backed up in: $BACKUP_DIR/env-files/
EOF
    
    print_success "Recovery instructions created"
}

create_team_instructions() {
    cat > "TEAM_ENV_CLEANUP_INSTRUCTIONS.md" << EOF
# Team Instructions: Git History Cleanup

Our git history has been cleaned to remove .env files. Please follow these steps:

## For All Team Members

### 1. Back up your local .env files
\`\`\`bash
# Create a backup directory
mkdir ~/env-backup-$(date +%Y%m%d)

# Copy all .env files
find . -name ".env*" -not -name "*.example" -type f -exec cp {} ~/env-backup-$(date +%Y%m%d)/ \;
\`\`\`

### 2. Delete your local repository
\`\`\`bash
cd ..
rm -rf $(basename "$PWD")
\`\`\`

### 3. Clone fresh
\`\`\`bash
git clone <repository-url>
cd $(basename "$PWD")
\`\`\`

### 4. Restore your .env files
Copy your backed-up .env files back to their original locations.

### 5. Verify .gitignore
Ensure these patterns are in .gitignore:
- .env
- .env.*
- !.env.example
- !.env.*.example

## Important Notes

- **DO NOT** pull or fetch on your old clone
- **DO NOT** try to merge old branches
- All old commits have new SHAs
- Force push was required to update remote

## Secret Rotation

All secrets that were in .env files should be rotated:
- [ ] Database passwords
- [ ] API keys
- [ ] JWT secrets
- [ ] OAuth credentials
- [ ] Any other sensitive data

## Questions?

Contact the team lead before proceeding if you have any concerns.
EOF
    
    print_success "Team instructions created: TEAM_ENV_CLEANUP_INSTRUCTIONS.md"
}

# Main execution
main() {
    print_header "Git History Cleanup - Remove .env Files"
    
    echo -e "${YELLOW}This script will remove all .env files from git history.${NC}"
    echo -e "${YELLOW}Make sure you have coordinated with your team!${NC}\n"
    
    read -p "Have you notified your team about this cleanup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please coordinate with your team first!"
        exit 1
    fi
    
    # Run all steps
    check_prerequisites
    download_bfg
    create_backup
    list_env_files_in_history
    create_env_gitignore
    create_recovery_instructions
    create_team_instructions
    run_bfg_cleanup
    cleanup_and_gc
    verify_cleanup
    print_next_steps
    
    # Cleanup temporary files
    rm -f .env-gitignore
    
    print_header "Cleanup Complete!"
    echo -e "${GREEN}Success! Check TEAM_ENV_CLEANUP_INSTRUCTIONS.md for team instructions.${NC}"
}

# Run main function
main