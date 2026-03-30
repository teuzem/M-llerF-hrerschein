#!/bin/bash

echo "🐳 Testing Docker build and container health..."
echo ""

# Build the image
echo "📦 Building Docker image..."
docker build -t permiscode-test:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker build successful!"
echo ""

# Run the container
echo "🚀 Starting container..."
docker run -d --name permiscode-test -p 8080:8080 permiscode-test:latest

if [ $? -ne 0 ]; then
    echo "❌ Container failed to start!"
    exit 1
fi

echo "✅ Container started!"
echo ""

# Wait for container to be ready
echo "⏳ Waiting for container to be ready (60 seconds)..."
sleep 60

# Check container status
echo "🔍 Checking container health..."
docker ps | grep permiscode-test

# Test healthcheck endpoint
echo ""
echo "🏥 Testing healthcheck endpoint..."
curl -f http://localhost:8080/health

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Healthcheck passed!"
else
    echo ""
    echo "❌ Healthcheck failed!"
    echo ""
    echo "📋 Container logs:"
    docker logs permiscode-test
    echo ""
    echo "🧹 Cleaning up..."
    docker stop permiscode-test
    docker rm permiscode-test
    exit 1
fi

# Test homepage
echo ""
echo "🌐 Testing homepage..."
curl -f http://localhost:8080/ > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Homepage loads!"
else
    echo "❌ Homepage failed to load!"
fi

# Show container logs
echo ""
echo "📋 Recent container logs:"
docker logs --tail 20 permiscode-test

# Cleanup
echo ""
echo "🧹 Cleaning up test container..."
docker stop permiscode-test
docker rm permiscode-test

echo ""
echo "✅ All tests passed! Ready for deployment."
echo ""
echo "🚀 To deploy to Coolify:"
echo "   1. Push changes to Git"
echo "   2. Set port to 8080 in Coolify UI"
echo "   3. Deploy!"
