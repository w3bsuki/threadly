# Environment File Cleanup Checklist

## Pre-Cleanup Checklist

### Team Coordination
- [ ] Notify all team members about the upcoming cleanup
- [ ] Schedule a time when no one is actively developing
- [ ] Ensure everyone has backed up their .env files
- [ ] Confirm all team members understand the process

### Preparation
- [ ] Ensure all changes are committed and pushed
- [ ] Verify no active pull requests need to be merged
- [ ] Document all environment variables currently in use
- [ ] Back up the entire repository

## Running the Cleanup Script

### Prerequisites
- [ ] Java is installed (for BFG Repo-Cleaner)
- [ ] No uncommitted changes in repository
- [ ] Script has execute permissions: `chmod +x scripts/remove-env-from-history.sh`

### Execute
```bash
cd /path/to/threadly
./scripts/remove-env-from-history.sh
```

## Post-Cleanup Checklist

### Immediate Actions

#### 1. Verify Cleanup Success
- [ ] Check script output for any errors
- [ ] Verify backup was created successfully
- [ ] Confirm .env files are removed from history
- [ ] Test that the repository still functions correctly

#### 2. Update Remote Repository
- [ ] Review changes with `git log --oneline -10`
- [ ] Force push all branches: `git push origin --force --all`
- [ ] Force push all tags: `git push origin --force --tags`
- [ ] Verify remote repository is updated

#### 3. Update .gitignore
- [ ] Ensure .gitignore contains:
  ```
  # Environment variables
  .env
  .env.*
  !.env.example
  !.env.*.example
  ```
- [ ] Commit and push .gitignore changes

### Team Communication

#### 4. Notify Team Members
- [ ] Send team instructions (TEAM_ENV_CLEANUP_INSTRUCTIONS.md)
- [ ] Confirm each team member has backed up their .env files
- [ ] Provide support channel for questions

#### 5. Monitor Team Updates
- [ ] Track each team member's progress:
  - [ ] Team Member 1: ___________
  - [ ] Team Member 2: ___________
  - [ ] Team Member 3: ___________
  - [ ] Team Member 4: ___________
- [ ] Assist with any issues
- [ ] Confirm everyone has fresh clones

### Security Actions

#### 6. Rotate All Secrets
- [ ] Database credentials
  - [ ] Production database password
  - [ ] Staging database password
  - [ ] Development database password
- [ ] API Keys
  - [ ] Stripe API keys
  - [ ] SendGrid/Email service keys
  - [ ] Third-party service keys
- [ ] Authentication Secrets
  - [ ] JWT secrets
  - [ ] Session secrets
  - [ ] OAuth client secrets
- [ ] Other Credentials
  - [ ] AWS/Cloud provider credentials
  - [ ] Redis passwords
  - [ ] Any other sensitive data

#### 7. Update Services
- [ ] Update environment variables in:
  - [ ] Vercel dashboard
  - [ ] CI/CD pipelines
  - [ ] Production servers
  - [ ] Staging servers
  - [ ] Docker configurations
- [ ] Test all services still work with new credentials

### Verification

#### 8. Final Verification
- [ ] Run full test suite
- [ ] Deploy to staging and verify
- [ ] Check production functionality
- [ ] Verify no .env files in git history:
  ```bash
  git log --all --name-only --pretty=format: | sort -u | grep -E "\.env" | grep -v example
  ```

#### 9. Documentation
- [ ] Update team documentation with new process
- [ ] Document the cleanup date and who performed it
- [ ] Update onboarding docs for new team members
- [ ] Archive backup location and retention plan

### Cleanup

#### 10. Post-Verification Cleanup (After 1-2 weeks)
- [ ] Confirm all team members working normally
- [ ] No issues reported
- [ ] Delete local backup (keep offsite backup longer)
- [ ] Remove BFG jar file
- [ ] Archive this checklist with completion date

## Rollback Plan

If issues arise:

1. **Stop all team members from pushing**
2. **Use recovery instructions** from backup folder
3. **Restore from backup**:
   ```bash
   cd backup-folder
   git push --mirror <original-remote-url>
   ```
4. **Notify team to re-clone**
5. **Investigate what went wrong**

## Long-term Maintenance

### Prevent Future Issues
- [ ] Set up pre-commit hooks to prevent .env commits
- [ ] Regular audits of git history
- [ ] Team training on secure credential management
- [ ] Consider using secret management tools:
  - [ ] HashiCorp Vault
  - [ ] AWS Secrets Manager
  - [ ] Vercel environment variables
  - [ ] Doppler
  - [ ] 1Password for Teams

### Best Practices
- [ ] Never commit real .env files
- [ ] Always use .env.example for templates
- [ ] Use secret management tools for production
- [ ] Rotate credentials regularly
- [ ] Audit access logs

## Sign-off

Cleanup performed by: _______________________
Date: _______________________
Verified by: _______________________

## Notes

_Use this space to document any issues, special considerations, or deviations from the process:_

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________