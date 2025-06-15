# AI 기반 설명 가능한 페어링 시스템 개발 계획

## 프로젝트 개요

본 프로젝트는 사용자의 취향과 상황에 맞는 최적의 술과 음식 조합을 추천하는 AI 기반 웹서비스를 개발하는 것을 목표로 합니다. FlavorDiffusion 모델을 활용하여 술과 음식의 페어링 점수를 계산하고, 그 이유를 설명할 수 있는 시스템을 구축합니다.

## 배포 구조 변경 완료 (2025-06-15)

### 🚀 하이브리드 배포 아키텍처 구축
- **프론트엔드**: Vercel 클라우드 배포
  - URL: https://ai-pairingsystem.vercel.app/
  - 자동 배포: GitHub 연동 CI/CD
  - 빌드 최적화: 정적 파일 CDN 제공
- **백엔드 서비스**: Docker 기반 로컬/서버 배포  
  - API 서버: http://localhost:5000
  - AI 모델 서버: http://localhost:8000
  - MySQL 데이터베이스: Docker 컨테이너
- **CORS 설정 개선**:
  - 환경변수를 통한 다중 origin 지원
  - Vercel 도메인 + 로컬 개발 환경 동시 지원
  - `CORS_ORIGIN=https://ai-pairingsystem.vercel.app,http://localhost:3000,http://localhost:3004`

### 🔧 Docker Compose 최적화
- **클라이언트 서비스 제거**: 용량 문제로 Vercel 이전
- **백엔드 환경변수 추가**:
  - `CLIENT_URL`: Vercel 프론트엔드 URL 설정
  - `CORS_ORIGIN`: 다중 도메인 CORS 지원
- **서비스 의존성 최적화**: MySQL → AI 모델 → 백엔드 순서

### 📱 클라이언트 API 설정 개선
- **환경별 API URL 설정**:
  - `.env.development`: 로컬 개발용
  - `.env.production`: Vercel 배포용  
  - `.env.local`: 개발자 개인 설정
- **API 서비스 개선**:
  - 환경변수 기반 API base URL 설정
  - `withCredentials: true` 설정으로 인증 지원
  - 프로덕션/개발 환경 자동 감지

### 📄 문서 업데이트
- **README.md**: 새로운 배포 구조 반영
- **프로젝트 계획**: 하이브리드 배포 방식 문서화
- **환경 설정 가이드**: 개발/배포 환경 분리 설명

## 이전 진행 작업 요약

### 🎯 절대적 평가 기준 적용 완료 (2025-06-14)
- 상대평가에서 절대평가로 변경하여 일관된 평가 시스템 구축
- Raw score 범위별 고정 점수 구간 설정 (0-100점)
- koreanMapper fallback 시스템 제거로 실제 데이터만 사용

### 🗄️ 데이터베이스 및 API 완료 
- MongoDB에서 MySQL로 완전 전환
- Hub_Nodes.csv와 Hub_Edges.csv 데이터 마이그레이션 완료
- 모든 REST API 엔드포인트 구현 및 테스트 완료
- AI 모델 통합 및 페어링 점수 예측 기능 구현

## 기술 스택

- **프론트엔드**: React (Vercel 배포)
- **백엔드**: Node.js + Express.js (Docker)
- **데이터베이스**: MySQL (Docker)
- **AI 모델**: FlavorDiffusion (GNN 기반, Docker)
- **자연어 생성**: OpenAI API
- **배포**: Vercel + Docker Compose

## 현재 서비스 상태

### ✅ 완료된 기능
- 전체 백엔드 API 시스템
- AI 기반 페어링 점수 계산
- 사용자 인증 및 권한 관리
- 데이터베이스 완전 마이그레이션
- Docker 기반 백엔드 배포
- Vercel 기반 프론트엔드 배포

### 🚧 개발 중인 기능
- 사용자 맞춤 추천 시스템
- 페어링 설명 고도화
- 관리자 대시보드

### 📋 향후 계획
- 성능 최적화
- 모바일 반응형 개선
- 추가 AI 모델 통합

## 애플리케이션 실행 방법

### 프로덕션 환경
```bash
# 백엔드 서비스 시작
docker-compose up -d

# 프론트엔드는 Vercel에서 자동 제공
# https://ai-pairingsystem.vercel.app/
```

### 개발 환경
```bash
# 백엔드 개발 서버
cd server
npm install
npm run dev  # http://localhost:5000

# 프론트엔드 개발 서버 (선택사항)
cd client  
npm install
npm start  # http://localhost:3004
```

## 환경 변수 설정

### 서버 (.env)
```
PORT=5000
JWT_SECRET=your-secret-jwt-key
OPENAI_API_KEY=your-openai-key
NODE_ENV=production

# MySQL (Docker)
DB_HOST=localhost
DB_PORT=3307
DB_USER=ai_pairing_user
DB_PASSWORD=8912@28DP
DB_NAME=ai_pairing_db

# CORS (Vercel + 로컬)
CORS_ORIGIN=https://ai-pairingsystem.vercel.app,http://localhost:3000,http://localhost:3004

# AI 서버
AI_SERVER_URL=http://ai-model:8000
```

### 클라이언트 (.env.production)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=production
```

## 주요 변경사항

1. **하이브리드 배포**: 프론트엔드는 Vercel, 백엔드는 Docker
2. **CORS 개선**: 다중 도메인 지원으로 개발/배포 환경 분리
3. **환경별 설정**: 개발/프로덕션 환경 자동 감지
4. **용량 최적화**: 클라이언트 Docker 제거로 리소스 절약

## 접속 정보

- **프론트엔드**: https://ai-pairingsystem.vercel.app/
- **API 서버**: http://localhost:5000
- **AI 모델 서버**: http://localhost:8000
- **데이터베이스**: MySQL (Docker, 포트 3307)

## 다음 단계

1. 백엔드 서버 외부 배포 (AWS/GCP)
2. 실제 프로덕션 API URL로 클라이언트 환경변수 업데이트
3. SSL 인증서 적용
4. 모니터링 및 로깅 시스템 구축