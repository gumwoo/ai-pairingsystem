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
- **데이터베이스**: MongoDB
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

### 설치

1. 리포지토리 복제
   ```
   git clone https://github.com/gumwoo/ai-pairingsystem.git
   cd ai-pairingsystem
   ```

2. 의존성 설치
   ```
   npm run install-all
   ```

3. 환경 변수 설정
   ```
   cp server/.env.example server/.env
   # .env 파일을 설정에 맞게 편집
   ```

4. 개발 서버 시작
   ```
   npm start
   ```

### Docker 배포

1. 컨테이너 빌드 및 시작
   ```
   docker-compose up -d
   ```

2. 서비스 접근
   - 프론트엔드: http://localhost
   - 백엔드 API: http://localhost:5000
   - AI 모델 API: http://localhost:8000

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

## 기여하기

기여는 언제나 환영합니다! Pull Request를 제출해 주세요.

## 라이센스

이 프로젝트는 MIT 라이센스에 따라 라이센스가 부여됩니다 - 자세한 내용은 LICENSE 파일을 참조하세요.

## 감사의 말

- 화합물 데이터를 제공한 FlavorDB
- 개발에 도움을 준 모든 기여자들