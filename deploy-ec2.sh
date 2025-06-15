#!/bin/bash

# EC2 배포 스크립트
echo "🚀 Starting EC2 deployment..."

# 기존 컨테이너 중지 및 제거
echo "📋 Stopping existing containers..."
docker-compose -f docker-compose.ec2.yml down --remove-orphans

# 이미지 빌드 및 컨테이너 시작
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.ec2.yml up -d --build

# 컨테이너 상태 확인
echo "✅ Checking container status..."
docker-compose -f docker-compose.ec2.yml ps

# 로그 확인
echo "📝 Checking server logs..."
sleep 10
docker logs ai-pairing-server --tail 20

echo "🎉 EC2 deployment completed!"
echo "📍 API Server: http://15.165.17.165:5000"
echo "📍 AI Model Server: http://15.165.17.165:8000"
echo "📍 Frontend: https://ai-pairingsystem.vercel.app"
echo ""
echo "🔧 Don't forget to:"
echo "   1. Update Vercel environment variables"
echo "   2. Configure EC2 Security Groups (ports 5000, 8000)"
echo "   3. Test API connectivity"