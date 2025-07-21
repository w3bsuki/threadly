#!/bin/bash

# Threadly Deployment Script
# Usage: ./scripts/deploy.sh [environment] [app]
# Example: ./scripts/deploy.sh production web

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
APP=${2:-all}
VALID_ENVIRONMENTS=("staging" "production")
VALID_APPS=("app" "web" "api" "all")

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate inputs
validate_inputs() {
    if [[ ! " ${VALID_ENVIRONMENTS[@]} " =~ " ${ENVIRONMENT} " ]]; then
        log_error "Invalid environment: $ENVIRONMENT"
        log_info "Valid environments: ${VALID_ENVIRONMENTS[*]}"
        exit 1
    fi
    
    if [[ ! " ${VALID_APPS[@]} " =~ " ${APP} " ]]; then
        log_error "Invalid app: $APP"
        log_info "Valid apps: ${VALID_APPS[*]}"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
    command -v pnpm >/dev/null 2>&1 || { log_error "pnpm is required but not installed."; exit 1; }
    command -v vercel >/dev/null 2>&1 || { log_error "Vercel CLI is required but not installed."; exit 1; }
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_NODE_VERSION="20.0.0"
    if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
        log_error "Node.js version $REQUIRED_NODE_VERSION or higher is required. Current: $NODE_VERSION"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "turbo.json" ]; then
        log_error "Must be run from the project root directory"
        exit 1
    fi
    
    # Check if git working directory is clean (for production)
    if [ "$ENVIRONMENT" == "production" ]; then
        if [ -n "$(git status --porcelain)" ]; then
            log_error "Git working directory is not clean. Commit or stash changes before production deployment."
            exit 1
        fi
        
        # Check if we're on main branch
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" != "main" ]; then
            log_error "Production deployments must be done from the main branch. Current branch: $CURRENT_BRANCH"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    pnpm install --frozen-lockfile
    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run linting
    log_info "Running linting..."
    pnpm lint
    
    # Run type checking
    log_info "Running type checking..."
    pnpm typecheck
    
    # Run unit tests
    log_info "Running unit tests..."
    pnpm test
    
    log_success "All tests passed"
}

# Build applications
build_apps() {
    local apps_to_build=()
    
    if [ "$APP" == "all" ]; then
        apps_to_build=("app" "web" "api")
    else
        apps_to_build=("$APP")
    fi
    
    for app in "${apps_to_build[@]}"; do
        log_info "Building $app..."
        pnpm --filter=@repo/$app build
        log_success "$app built successfully"
    done
}

# Run database migrations (production only)
run_migrations() {
    if [ "$ENVIRONMENT" == "production" ]; then
        log_info "Running database migrations..."
        pnpm db:deploy
        log_success "Database migrations completed"
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    local apps_to_deploy=()
    
    if [ "$APP" == "all" ]; then
        apps_to_deploy=("app" "web" "api")
    else
        apps_to_deploy=("$APP")
    fi
    
    for app in "${apps_to_deploy[@]}"; do
        log_info "Deploying $app to $ENVIRONMENT..."
        
        cd "apps/$app"
        
        # Pull Vercel environment
        if [ "$ENVIRONMENT" == "production" ]; then
            vercel pull --yes --environment=production
            vercel build --prod
            DEPLOYMENT_URL=$(vercel deploy --prebuilt --prod)
        else
            vercel pull --yes --environment=preview
            vercel build
            DEPLOYMENT_URL=$(vercel deploy --prebuilt)
        fi
        
        cd ../..
        
        log_success "$app deployed to: $DEPLOYMENT_URL"
        
        # Store deployment URL for notifications
        echo "$app=$DEPLOYMENT_URL" >> /tmp/threadly_deployment_urls.txt
    done
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    # Read deployment URLs
    if [ -f "/tmp/threadly_deployment_urls.txt" ]; then
        while IFS='=' read -r app url; do
            log_info "Health checking $app at $url..."
            
            # Basic health check
            if curl -f -s "$url/health" > /dev/null 2>&1 || curl -f -s "$url/api/health" > /dev/null 2>&1; then
                log_success "$app health check passed"
            else
                log_warning "$app health check failed or no health endpoint available"
            fi
        done < /tmp/threadly_deployment_urls.txt
    fi
}

# Send notifications
send_notifications() {
    log_info "Sending deployment notifications..."
    
    # Prepare notification message
    local message="🚀 **Threadly Deployment Complete**\n\n"
    message+="**Environment:** $ENVIRONMENT\n"
    message+="**Apps:** $APP\n"
    message+="**Deployed by:** $(git config user.name) ($(git config user.email))\n"
    message+="**Commit:** $(git rev-parse --short HEAD) - $(git log -1 --pretty=%B | head -n1)\n\n"
    
    # Add deployment URLs
    if [ -f "/tmp/threadly_deployment_urls.txt" ]; then
        message+="**Deployment URLs:**\n"
        while IFS='=' read -r app url; do
            message+="- **$app:** $url\n"
        done < /tmp/threadly_deployment_urls.txt
    fi
    
    # Send to Slack if webhook is configured
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || log_warning "Failed to send Slack notification"
    fi
    
    # Send email notification if configured
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo -e "$message" | mail -s "Threadly Deployment - $ENVIRONMENT" "$NOTIFICATION_EMAIL" > /dev/null 2>&1 || log_warning "Failed to send email notification"
    fi
    
    log_success "Notifications sent"
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    rm -f /tmp/threadly_deployment_urls.txt
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting Threadly deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "App: $APP"
    
    # Run deployment steps
    validate_inputs
    check_prerequisites
    install_dependencies
    
    # Skip tests for staging if SKIP_TESTS is set
    if [ "$ENVIRONMENT" == "production" ] || [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    fi
    
    build_apps
    run_migrations
    deploy_to_vercel
    health_check
    send_notifications
    cleanup
    
    log_success "Deployment completed successfully! 🎉"
    
    # Show deployment summary
    if [ -f "/tmp/threadly_deployment_urls.txt" ]; then
        echo
        log_info "Deployment Summary:"
        while IFS='=' read -r app url; do
            echo "  $app: $url"
        done < /tmp/threadly_deployment_urls.txt
    fi
}

# Handle script interruption
trap 'log_error "Deployment interrupted!"; cleanup; exit 1' INT TERM

# Show help
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Threadly Deployment Script"
    echo
    echo "Usage: $0 [environment] [app]"
    echo
    echo "Environments:"
    echo "  staging     Deploy to staging environment (default)"
    echo "  production  Deploy to production environment"
    echo
    echo "Apps:"
    echo "  app         Deploy the main user application"
    echo "  web         Deploy the public marketplace"
    echo "  api         Deploy the API backend"
    echo "  all         Deploy all applications (default)"
    echo
    echo "Environment Variables:"
    echo "  SKIP_TESTS=true         Skip tests for faster deployment (staging only)"
    echo "  SLACK_WEBHOOK_URL       Slack webhook for notifications"
    echo "  NOTIFICATION_EMAIL      Email address for notifications"
    echo
    echo "Examples:"
    echo "  $0                      Deploy all apps to staging"
    echo "  $0 production web       Deploy web app to production"
    echo "  SKIP_TESTS=true $0 staging app    Deploy app to staging without tests"
    exit 0
fi

# Run main function
main