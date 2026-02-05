#!/bin/bash

# Lupyd Desktop Build Script
# This script helps with building and running the Tauri desktop application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Rust is installed
check_rust() {
    if ! command -v rustc &> /dev/null; then
        print_error "Rust is not installed. Please install Rust from https://rustup.rs/"
        exit 1
    fi
    print_success "Rust is installed: $(rustc --version)"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js is installed: $(node --version)"
}

# Check if Yarn is installed
check_yarn() {
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn is not installed. Please install Yarn from https://yarnpkg.com/"
        exit 1
    fi
    print_success "Yarn is installed: $(yarn --version)"
}

# Setup environment
setup_env() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_status "Creating .env file from .env.example..."
            cp .env.example .env
            print_warning "Please edit .env file with your actual configuration values"
        else
            print_warning "No .env.example found. You may need to create a .env file manually"
        fi
    else
        print_success ".env file already exists"
    fi
}

# Install dependencies
install_deps() {
    print_status "Installing frontend dependencies..."
    yarn install
    
    print_status "Installing Tauri CLI if not present..."
    if ! yarn tauri --version &> /dev/null; then
        yarn add -D @tauri-apps/cli
    fi
    
    print_success "Dependencies installed successfully"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    yarn build
    print_success "Frontend built successfully"
}

# Run development server
dev() {
    print_status "Starting development server..."
    setup_env
    yarn tauri dev
}

# Build for production
build_prod() {
    print_status "Building for production..."
    setup_env
    build_frontend
    yarn tauri build
    print_success "Production build completed"
}

# Clean build artifacts
clean() {
    print_status "Cleaning build artifacts..."
    rm -rf dist/
    rm -rf src-tauri/target/
    rm -rf node_modules/
    print_success "Clean completed"
}

# Check system requirements
check_system() {
    print_status "Checking system requirements..."
    check_rust
    check_node
    check_yarn
    print_success "System requirements check passed"
}

# Run tests
test() {
    print_status "Running tests..."
    # Frontend tests
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        yarn test
    fi
    
    # Rust tests
    cd src-tauri
    cargo test
    cd ..
    
    print_success "Tests completed"
}

# Format code
format() {
    print_status "Formatting code..."
    
    # Format frontend code
    if command -v prettier &> /dev/null; then
        yarn prettier --write "src/**/*.{ts,tsx,js,jsx}"
    fi
    
    # Format Rust code
    cd src-tauri
    cargo fmt
    cd ..
    
    print_success "Code formatting completed"
}

# Lint code
lint() {
    print_status "Linting code..."
    
    # Lint frontend
    if [ -f "package.json" ] && grep -q '"lint"' package.json; then
        yarn lint
    fi
    
    # Lint Rust code
    cd src-tauri
    cargo clippy -- -D warnings
    cd ..
    
    print_success "Linting completed"
}

# Show app info
info() {
    print_status "Lupyd Desktop Application Info"
    echo ""
    echo "Project Structure:"
    echo "  - Frontend: React + TypeScript + Vite"
    echo "  - Backend: Rust + Tauri"
    echo "  - Database: SQLite"
    echo "  - Messaging: Firefly Signal Protocol"
    echo ""
    echo "Key Features:"
    echo "  - End-to-end encrypted messaging"
    echo "  - Group messaging"
    echo "  - File sharing with encryption"
    echo "  - Desktop notifications"
    echo "  - System tray integration"
    echo "  - Deep link support"
    echo ""
    if [ -f ".env" ]; then
        echo "Environment: Configured"
    else
        echo "Environment: Not configured (run 'setup' command)"
    fi
}

# Setup development environment
setup() {
    print_status "Setting up development environment..."
    check_system
    setup_env
    install_deps
    print_success "Development environment setup completed"
    print_warning "Don't forget to edit .env file with your configuration"
}

# Show help
show_help() {
    echo "Lupyd Desktop Build Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Setup development environment (check system, install deps, create .env)"
    echo "  check     - Check system requirements"
    echo "  install   - Install dependencies"
    echo "  dev       - Start development server"
    echo "  build     - Build frontend only"
    echo "  prod      - Build for production"
    echo "  test      - Run tests"
    echo "  lint      - Lint code"
    echo "  format    - Format code"
    echo "  clean     - Clean build artifacts"
    echo "  info      - Show application info"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # First time setup"
    echo "  $0 dev       # Start development with hot reload"
    echo "  $0 prod      # Create production build"
    echo "  $0 test      # Run all tests"
}

# Main script logic
case "${1:-help}" in
    "setup")
        setup
        ;;
    "check")
        check_system
        ;;
    "install")
        check_system
        install_deps
        ;;
    "dev")
        check_system
        dev
        ;;
    "build")
        check_system
        build_frontend
        ;;
    "prod")
        check_system
        build_prod
        ;;
    "test")
        check_system
        test
        ;;
    "lint")
        check_system
        lint
        ;;
    "format")
        check_system
        format
        ;;
    "clean")
        clean
        ;;
    "info")
        info
        ;;
    "help"|*)
        show_help
        ;;
esac