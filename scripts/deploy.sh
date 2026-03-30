#!/bin/bash

# PermisCode Deployment Script
# This script helps deploy the application to various environments

set -e

echo "🚀 PermisCode Deployment Script"
echo "================================"
echo ""

# Check if Node.js 20+ is installed
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20 or higher is required"
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"

# Function to deploy to Netlify
deploy_netlify() {
    echo ""
    echo "📦 Deploying to Netlify..."

    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi

    # Build the application
    echo "Building application..."
    npm run build

    # Deploy
    echo "Deploying to Netlify..."
    netlify deploy --prod

    echo "✅ Netlify deployment complete!"
}

# Function to build Docker image
deploy_docker() {
    echo ""
    echo "🐳 Building Docker image..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Error: Docker is not installed"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    # Build image
    docker build -t permiscode:latest .

    echo "✅ Docker image built successfully!"
    echo ""
    echo "To run the container:"
    echo "  docker run -p 8080:8080 --env-file .env permiscode:latest"
}

# Function to deploy with Docker Compose
deploy_docker_compose() {
    echo ""
    echo "🐳 Deploying with Docker Compose..."

    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Error: Docker Compose is not installed"
        echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi

    # Check if .env file exists
    if [ ! -f .env ]; then
        echo "❌ Error: .env file not found"
        echo "Please create a .env file from .env.example"
        exit 1
    fi

    # Deploy
    docker-compose up -d --build

    echo "✅ Docker Compose deployment complete!"
    echo ""
    echo "Application running at: http://localhost:8080"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
}

# Function to prepare for Coolify
prepare_coolify() {
    echo ""
    echo "🌊 Preparing for Coolify deployment..."
    echo ""
    echo "Steps to deploy on Coolify:"
    echo "1. Push your code to GitHub"
    echo "2. In Coolify dashboard, create a new project"
    echo "3. Select 'GitHub' as source and choose this repository"
    echo "4. Set build type to 'Dockerfile'"
    echo "5. Set port to '8080'"
    echo "6. Add environment variables:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "7. Configure your domain"
    echo "8. Click 'Deploy'"
    echo ""
    echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
    echo "✅ Ready for Coolify deployment!"
}

# Main menu
echo ""
echo "Select deployment target:"
echo "1) Netlify"
echo "2) Docker (build image)"
echo "3) Docker Compose (full stack)"
echo "4) Coolify (instructions)"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_netlify
        ;;
    2)
        deploy_docker
        ;;
    3)
        deploy_docker_compose
        ;;
    4)
        prepare_coolify
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process complete!"
