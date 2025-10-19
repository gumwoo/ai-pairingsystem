# AI 기반 설명 가능한 페어링 시스템

사용자의 취향과 상황에 맞는 최적의 음식과 음료 조합을 추천하는 AI 기반 웹 서비스입니다.

## 개요

이 프로젝트는 음식과 음료 페어링에 대한 설명 가능한 추천 시스템을 만들기 위해 AI를 활용합니다. 시스템은 플레이버 화합물과 프로파일을 분석하여 최고의 조합을 제안하고, 특정 페어링이 왜 잘 어울리는지에 대한 명확한 설명을 제공합니다.

## 주요 기능

- **AI 기반 추천**: FlavorDiffusion 모델을 사용하여 최적의 페어링 추천
- **설명 가능한 AI**: 페어링 추천에 대한 투명한 설명 제공
- **포괄적인 데이터베이스**: 다양한 주류와 재료 컬렉션 포함
- **사용자 취향**: 사용자 선호도와 이력을 고려
- **인터랙티브 UI**: 페어링을 탐색하기 위한 깔끔하고 직관적인 인터페이스

## 기술 스택

- **프론트엔드**: React
- **백엔드**: Express.js (Node.js)
- **데이터베이스**: Mysql
- **AI 모델**: FlavorDiffusion (GNN 기반 모델)
- **배포**: Docker 컨테이너 및 AWS

## 프로젝트 구조

```
ai-pairing/
├── ai-server/               # AI 모델 및 훈련 코드
│   ├── dataset/             # 데이터셋 파일
│   ├── model/               # 모델 구현
│   ├── api.py               # 모델 서빙을 위한 FastAPI 서버
│   └── Dockerfile.model     # AI 서비스를 위한 Docker 설정
│
├── client/                  # React 프론트엔드
│   ├── public/              # 정적 파일
│   ├── src/                 # 소스 코드
│   │   ├── components/      # React 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── services/        # API 서비스
│   │   └── assets/          # 이미지, 스타일 등
│   ├── Dockerfile           # 프론트엔드용 Docker 설정
│   └── nginx.conf           # Nginx 설정
│
├── server/                  # Express.js 백엔드
│   ├── src/                 # 소스 코드
│   │   ├── config/          # 설정 파일
│   │   ├── controllers/     # 라우트 컨트롤러
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── routes/          # API 라우트
│   │   ├── middleware/      # 커스텀 미들웨어
│   │   └── ai/              # AI 모델 통합
│   └── Dockerfile           # 백엔드용 Docker 설정
│
└── docker-compose.yml       # Docker Compose 설정
```

## 시작하기

### 사전 요구사항

- Node.js (v16 이상)
- Python 3.9+
- MongoDB
- Docker 및 Docker Compose (컨테이너화된 배포용)


## 배포 구조

### 프론트엔드 (Vercel)
- **URL**: https://ai-pairingsystem.vercel.app/
- **배포 플랫폼**: Vercel
- **자동 배포**: GitHub 연동을 통한 CI/CD

### 백엔드 서비스 (Docker)
- **API 서버**: http://localhost:5000
- **AI 모델 서버**: http://localhost:8000  
- **데이터베이스**: MySQL (Docker 컨테이너)
- **배포**: Docker Compose를 통한 컨테이너화

### 개발 환경 설정

#### 로컬 개발
```bash
# 백엔드 및 AI 서비스 시작 (Docker)
docker-compose up -d

# 프론트엔드 개발 서버 (선택사항 - Vercel 사용 시 불필요)
cd client
npm start  # http://localhost:3004
```

#### 프로덕션 배포
- **프론트엔드**: Vercel에서 자동 배포
- **백엔드**: Docker Compose로 서버 배포
- **환경변수**: 각 서비스별 환경변수 설정 필요

## 데이터 소스

- **FlavorDB**: 플레이버 분자 데이터베이스
- **WineReview**: 와인 리뷰 및 페어링 데이터
- **Recipe1M**: 재료 관계를 위한 레시피 데이터셋

## 모델 훈련

FlavorDiffusion 모델은 주류, 재료 및 그들이 공유하는 화합물의 그래프에서 훈련됩니다. 모델은 화학적 특성과 역사적 페어링 데이터를 기반으로 주류와 재료 간의 호환성 점수를 예측하는 법을 학습합니다.

처음부터 모델을 훈련하려면:

```
cd ai-server
python model/train.py
```
