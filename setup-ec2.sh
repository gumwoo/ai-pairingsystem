#!/bin/bash

# EC2 환경변수 설정 및 배포 스크립트
echo "🔧 Setting up environment for EC2..."

# 실제 API 키 설정 (배포 시 수동으로 입력 필요)
read -p "Enter your OpenAI API Key: " OPENAI_KEY
read -p "Enter your JWT Secret: " JWT_SECRET

# .env 파일 생성
cat > server/.env << EOF
PORT=5000
JWT_SECRET=${JWT_SECRET}
OPENAI_API_KEY=${OPENAI_KEY}
NODE_ENV=production

# MySQL Connection (Docker Container - EC2)
DB_HOST=mysql-db
DB_PORT=3306
DB_USER=ai_pairing_user
DB_PASSWORD=8912@28DP
DB_NAME=ai_pairing_db

# CORS (Vercel + EC2 + 로컬 개발)
CORS_ORIGIN=https://ai-pairingsystem.vercel.app,http://15.165.17.165:5000,http://localhost:3000,http://localhost:3004

# AI 서버 Docker 컨테이너 연결
AI_SERVER_URL=http://ai-model:8000

# EC2 Client URL
CLIENT_URL=https://ai-pairingsystem.vercel.app
EOF

echo "✅ Environment variables configured"

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo service docker start
    sudo usermod -a -G docker $USER
fi

# Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "🚀 Starting deployment..."
./deploy-ec2.sh