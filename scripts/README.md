# Git History Cleanup Scripts

This directory contains scripts to safely remove `.env` files from git history and prevent future commits of sensitive files.

## Scripts Overview

### 1. `remove-env-from-history.sh` (Recommended)
Main cleanup script using BFG Repo-Cleaner - fast and reliable.

**Features:**
- Uses BFG Repo-Cleaner (automatically downloads)
- Creates comprehensive backups
- Provides team instructions
- Includes recovery procedures
- Safe with multiple checks

**Requirements:**
- Java (for BFG)
- Git
- Bash

**Usage:**
```bash
./scripts/remove-env-from-history.sh
```

### 2. `remove-env-filter-branch.sh` (Alternative)
Alternative script using git's built-in filter-branch command.

**Features:**
- No external dependencies
- Uses only git commands
- Slower but equally effective
- Creates backups

**Usage:**
```bash
./scripts/remove-env-filter-branch.sh
```

### 3. `install-env-pre-commit.sh`
Installs a git pre-commit hook to prevent future .env commits.

**Features:**
- Blocks .env file commits
- Warns about potential secrets
- Allows override if needed

**Usage:**
```bash
./scripts/install-env-pre-commit.sh
```

## Quick Start Guide

### Step 1: Prepare
1. **Coordinate with your team** - Everyone needs to be aware
2. **Ensure clean working directory** - Commit all changes
3. **Back up .env files** - Save them outside the repo

### Step 2: Run Cleanup
Choose one method:
```bash
# Method 1: BFG (Recommended - faster)
./scripts/remove-env-from-history.sh

# Method 2: Git filter-branch (Alternative - no Java required)
./scripts/remove-env-filter-branch.sh
```

### Step 3: Update Remote
```bash
# Force push all branches
git push origin --force --all

# Force push all tags  
git push origin --force --tags
```

### Step 4: Team Actions
All team members must:
1. Back up their .env files
2. Delete local repository
3. Clone fresh: `git clone <repo-url>`
4. Restore .env files
5. Run: `./scripts/install-env-pre-commit.sh`

### Step 5: Security
**Rotate ALL credentials** that were in .env files:
- Database passwords
- API keys
- JWT secrets
- OAuth credentials

## Important Files Generated

- `TEAM_ENV_CLEANUP_INSTRUCTIONS.md` - Instructions for team members
- `git-backup-*/` - Complete repository backup
- `git-backup-*/RECOVERY.md` - Recovery instructions
- `git-backup-*/env-files/` - Backed up .env files

## Recovery

If something goes wrong:
```bash
# From backup directory
./recover.sh

# Or manually
rm -rf .git
cp -r git-backup-*/*.git .git
git reset --hard HEAD
```

## Prevention

After cleanup, install the pre-commit hook:
```bash
./scripts/install-env-pre-commit.sh
```

Update `.gitignore`:
```gitignore
# Environment variables
.env
.env.*
!.env.example
!.env.*.example
```

## Checklist

Use `env-cleanup-checklist.md` for a complete step-by-step checklist.

## Troubleshooting

### BFG download fails
- Check internet connection
- Download manually from: https://rtyley.github.io/bfg-repo-cleaner/
- Place in scripts directory as `bfg-1.14.0.jar`

### Java not found
- Install Java from: https://www.java.com/download/
- Or use the filter-branch alternative script

### Permission denied
```bash
chmod +x scripts/*.sh
```

### Force push rejected
- Ensure you have force push permissions
- Check branch protection rules
- Coordinate with repository admins

## Best Practices

1. **Never commit .env files** - Use .env.example instead
2. **Use secret management** - Consider tools like Vault, AWS Secrets Manager
3. **Regular audits** - Check git history periodically
4. **Team training** - Ensure everyone understands the risks
5. **Pre-commit hooks** - Install on all developer machines

## Support

If you encounter issues:
1. Check the generated backup directory for logs
2. Review error messages carefully
3. Use recovery procedures if needed
4. Contact team lead or DevOps team

Remember: **Always coordinate with your team before running cleanup!**