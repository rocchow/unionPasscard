#!/bin/bash
#
# Setup script for Union Passcard project
# Supports both npm and Bun package managers
#

set -e

echo "🚀 Setting up Union Passcard project..."

# Check if Bun is available and user wants to use it
if command -v bun >/dev/null 2>&1; then
    echo "📦 Bun is available on your system"
    echo "Would you like to use Bun instead of npm? (y/n)"
    read -r use_bun
    
    if [ "$use_bun" = "y" ] || [ "$use_bun" = "Y" ]; then
        echo "📦 Using Bun for package management..."
        
        # Install dependencies with Bun
        bun install
        
        echo "✅ Dependencies installed with Bun"
        echo "🏗️  Running build check with Bun..."
        
        # Test build
        bun run build-check
        
        echo ""
        echo "🎉 Setup complete! You can now use:"
        echo "  bun run dev        # Start development server"
        echo "  bun run build      # Build for production"
        echo "  bun run build-check # Run full build check"
        
    else
        use_npm=true
    fi
else
    echo "📦 Bun not found, using npm..."
    use_npm=true
fi

if [ "$use_npm" = true ]; then
    echo "📦 Using npm for package management..."
    
    # Install dependencies with npm
    npm install
    
    echo "✅ Dependencies installed with npm"
    echo "🏗️  Running build check with npm..."
    
    # Test build
    npm run build-check
    
    echo ""
    echo "🎉 Setup complete! You can now use:"
    echo "  npm run dev        # Start development server"
    echo "  npm run build      # Build for production"
    echo "  npm run build-check # Run full build check"
fi

echo ""
echo "🔧 Git pre-commit hooks are set up to run build checks automatically"
echo "📝 To install Bun: curl -fsSL https://bun.sh/install | bash"
