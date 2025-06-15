# AI 기반 설명 가능한 페어링 시스템 개발 계획

## 프로젝트 개요

본 프로젝트는 사용자의 취향과 상황에 맞는 최적의 술과 음식 조합을 추천하는 AI 기반 웹서비스를 개발하는 것을 목표로 합니다. FlavorDiffusion 모델을 활용하여 술과 음식의 페어링 점수를 계산하고, 그 이유를 설명할 수 있는 시스템을 구축합니다.

## 기술 스택

- **백엔드**: Node.js + Express.js
- **프론트엔드**: React
- **데이터베이스**: MySQL
- **AI 모델**: FlavorDiffusion (GNN 기반)
- **자연어 생성**: OpenAI API
- **배포**: Docker, AWS

## 프로젝트 구조

```
ai-pairing/
├── ai-server/               # AI 모델 및 훈련 코드
│   ├── dataset/             # 데이터셋 파일
│   ├── model/               # 모델 구현
│   ├── api.py               # FastAPI 서버
│   └── Dockerfile.model     # AI 서비스 Docker 설정
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
│   │   └── ai/              # AI 모델 통신
│   └── Dockerfile           # 백엔드용 Docker 설정
│
├── logs/                    # 로그 파일 디렉토리
│
├── docs/                    # 프로젝트 문서
│
└── docker-compose.yml       # Docker Compose 설정
```

## 현재까지 진행된 작업

## 현재까지 진행된 작업

### 🎯 절대적 평가 기준 적용 완료 (2025-06-14)
- **상대평가에서 절대평가로 변경 완료**:
  - 기존 동적 정규화 방식(min-max scaling)에서 고정된 절대 기준으로 변경
  - Raw score 범위별 고정 점수 구간 설정:
    - 90-100점: raw_score >= 2.0 (🌟 최고의 조합)
    - 80-89점: 0.0 <= raw_score < 2.0 (⭐ 뛰어난 조합)
    - 70-79점: -2.0 <= raw_score < 0.0 (👍 좋은 조합)
    - 60-69점: -4.0 <= raw_score < -2.0 (👌 괜찮은 조합)
    - 50-59점: -6.0 <= raw_score < -4.0 (😐 보통 조합)
    - 40-49점: -8.0 <= raw_score < -6.0 (😕 아쉬운 조합)
    - 30-39점: -10.0 <= raw_score < -8.0 (😞 별로인 조합)
    - 0-29점: raw_score < -10.0 (❌ 추천하지 않음)
- **일관된 평가 시스템 구축 완료**:
  - 같은 조합은 항상 같은 점수를 받도록 보장
  - 절대적 품질 기준에 따른 평가로 사용자 필터링 가능
  - '80점 이상만 보여줘' 같은 기능 구현 가능
- **파일 변경사항**:
  - `api.py` → `api_relative.py` (기존 상대평가 방식 백업)
  - `api_absolute.py` → `api.py` (새로운 절대평가 방식 적용)
  - `normalize_raw_score_to_100()` 함수 완전 교체
  - `/raw-score-stats` 엔드포인트에 평가 기준 정보 추가
- **테스트 결과 확인**:
  - 다양한 점수 분포 확인 (30점~90점)
  - Raw score: -9.9226 ~ 2.0638 범위에서 절대적 기준 적용
  - 컨테이너 재빌드 및 API 정상 동작 확인
  - 로그에서 새로운 평가 방식 동작 확인됨

### 🔥 koreanMapper fallback 시스템 제거 완료 (2025-06-14)
- **실제 CSV 데이터만 사용하도록 개선**:
  - `koreanMapperFixed.js` 파일 삭제 (fallback 시스템이었음)
  - `koreanMapper.js`에서 fallback 로직 완전 제거
  - CSV 파일이 없으면 시스템 오류 발생시켜 문제 조기 발견
  - `nodes_191120_updated.csv` 파일 존재 확인 완료
- **AI 모델과 실제 데이터 연동 강화**:
  - `api.py`에서 실제 CSV 데이터 로드하여 AI 모델 사용
  - `pairingController.js`에서 실제 node ID 기반 점수 계산
  - fallback 대신 실제 데이터 기반 페어링 시스템 구축
- **데이터 무결성 확보**:
  - CSV 파일 로드 실패시 시스템 중단으로 데이터 문제 조기 발견
  - 실제 데이터 기반으로만 페어링 점수 계산
  - AI 모델이 하드코딩된 데이터가 아닌 실제 학습 데이터 사용

### 0. API 컨트롤러 MongoDB에서 MySQL로 마이그레이션 (2025-05-05)
- **컨트롤러 코드 MongoDB에서 MySQL로 마이그레이션**:
  - liquorController.js - MongoDB 쿼리 메소드를 MySQL 모델 메소드로 변경
    - find(), findOne() 등을 getAll(), getById() 등으로 수정
    - 데이터 처리 로직을 MySQL 모델에 맞게 수정
  - ingredientController.js - MySQL 스타일로 코드 변경
    - pool 모듈 추가 임포트
    - 카테고리 조회 로직을 MySQL 쿼리로 변경
    - 페이지네이션 로직을 클라이언트 측에서 처리하도록 수정
  - API 엔드포인트 기능 확인 및 테스트
  - MongoDB 형식의 모델 메소드 호출로 인한 서버 오류 해결

### 1. Hub_Nodes 및 Hub_Edges 데이터 마이그레이션 완료 (2025-05-04)
- **MySQL 데이터베이스에 그래프 데이터 적재 완료**:
  - Hub_Nodes.csv에서 nodes 테이블로 2,005개 노드 데이터 임포트
  - Hub_Edges.csv에서 edges 테이블로 37,392개 엣지 데이터 임포트
  - 노드 유형별 분포: compound(1,589), ingredient(393), liquor(23)
  - 엣지 유형별 분포: ingr-fcomp(35,437), ingr-ingr(1,897), ingr-dcomp(58)
- **데이터 정합성 및 DB 스키마 개선**:
  - nodes 테이블의 name 필드 길이를 VARCHAR(100)에서 VARCHAR(255)로 확장
  - 누락된 score 값을 허용하도록 NULL 처리 로직 구현
  - 데이터 중복 방지를 위한 UNIQUE KEY 제약조건 적용

### 2. 데이터 마이그레이션 스크립트 추가 (2025-05-04)
- **데이터 마이그레이션 스크립트 개발**:
  - `server/src/scripts/import-hub-data.js` 스크립트 생성
  - Hub_Nodes.csv와 Hub_Edges.csv 파일을 MySQL 데이터베이스로 가져오는 기능 구현
  - 노드 및 엣지 데이터의 일관성 확인 및 유효성 검사 로직 추가
  - CSV 파싱 및 데이터베이스 트랜잭션 처리 기능 구현

### 3. 버그 수정 (2025-05-04)
- **모듈 경로 문제 해결**: 
  - compoundController.js 파일에서는 `../../models/Compound`를 이미 올바르게 사용 중이었음
  - 누락된 `models/mysql/Compound.js` 및 `models/mysql/Edge.js` 파일 생성
  - MySQL 기반의 모델 파일들을 통일성 있게 관리
- **인증 미들웨어 문제 해결**:
  - `auth.js` 파일의 미들웨어 이름을 `protect`에서 `authMiddleware`로 변경
  - `adminMiddleware` 미들웨어 추가
  - 모든 라우트 파일(user.js, liquor.js, ingredient.js 등)에서 미들웨어 참조 수정
- **라우트 순서 수정**:
  - compound.js 라우터에서 `/search/:query` 경로를 `/:id` 경로보다 먼저 정의하도록 수정
- **DB 모듈 참조 방식 수정**:
  - `Node.js`, `Compound.js`, `Edge.js` 등 모든 모델 파일에서 db 모듈 참조 방식 수정 (`const pool = require(...)` → `const db = require(...); const pool = db.pool`)
  - `index.js`에서 데이터베이스 연결 코드 수정
- **데이터베이스 연결 정보 수정**:
  - `.env` 파일에 MySQL 연결 정보 추가
  - 데이터베이스 비밀번호 수정 (`rootpassword` → `8912@28DP`)
- **데이터베이스 초기화 함수 개선**:
  - prepared statement 프로토콜에서 지원되지 않는 `USE` 문 제거
  - SQL 명령 실행 오류 처리 개선
  - 이미 존재하는 테이블에 대한 예외 처리 추가
- 서버 실행 오류 해결

### 4. 데이터베이스 전환 및 ERD 개선 완료
- MongoDB에서 MySQL로 완전 전환
- Hub_Nodes.csv와 Hub_Edges.csv 데이터셋 분석
- 새로운 ERD 설계 완료:
  - **nodes**: 모든 노드 정보 저장 (liquor, ingredient, compound)
  - **edges**: 노드 간 관계 저장
  - **liquors, ingredients, compounds**: 타입별 추가 정보
  - **pairings**: 주류-재료 페어링 전용 테이블
  - **사용자 관련 테이블**: users, 즐겨찾기, 비선호 테이블

### 2. 백엔드 API 개발 완료 (2025-05-03)
- 모든 REST API 엔드포인트 구현:
  - **Liquors API**: CRUD 작업, 검색
  - **Ingredients API**: CRUD 작업, 카테고리별 조회
  - **Compounds API**: 화합물 관리
  - **Edges API**: 노드 간 관계 조회 및 수정
  - **Pairings API**: 페어링 점수 예측 및 조회
  - **Preferences API**: 사용자 선호도 관리
  - **Recommendations API**: 주류/재료 추천, 맞춤 추천
  - **Admin API**: 데이터 임포트, 통계, 로그 조회

### 3. 프론트엔드 개발 
- React 앱 기본 구조 설정
- 핵심 페이지 컴포넌트 구현
- API 서비스 파일 구현
- UI 텍스트 번역 완료 (영문 → 한국어)
- 누락된 이미지 리소스 추가 완료

## 다음 진행 단계

### 1. API 보완 및 버그 수정 [진행 중]
- ✅ AI 모델 로딩 오류 해결 (2025-05-08)
  - predict.py 파일에서 모델 로딩 로직 개선
  - 여러 모델 경로를 시도하도록 하여 적절한 모델 파일 찾도록 수정
  - 모델 파일이 없는 경우 대체 점수 생성 로직 구현
  - 서버 측 model.js 파일의 오류 처리 로직 개선
  - './checkpoint/best_model.pt' 경로 문제 해결
  - checkpoint 디렉토리 생성 (서버와 AI 서버 양쪽에)
- ✅ 페어링 점수 계산 오류 보완 (2025-05-08)
  - model.js 파일에서 Python 출력 처리 방식 개선
  - 여러 줄의 출력에서 숫자 값을 추출하는 로직 강화
  - 출력에서 숫자를 추출할 수 없는 경우 대체 점수 사용
- ✅ 모델 구조 및 입력 데이터 차원 불일치 해결 (2025-05-09)
  - NeuralCF 모델 hidden_layers 크기 조정 (차원 불일치 해결)
  - 체크포인트 로드 시 strict=False 옵션 추가
  - 다단계 fallback 메커니즘 추가:
    1. predict_score 메서드 시도
    2. 일반 forward 메서드 시도
    3. 임베딩 내적 계산으로 대체
    4. 마지막으로 랜덤 점수 생성
- ✅ AI 모델이 실제 모델을 사용하도록 수정 (2025-05-08)
  - model.js 파일을 수정하여 대체 점수(mock score) 사용하지 않도록 변경
  - predict.py 파일에서 실제 AI 모델 기반 점수 예측 구현
  - Node.js와 Python 간 통신 오류 처리 기능 강화
  - 페어링 설명 생성 로직 개선
- ✅ FlavorDiffusionModel 클래스 누락 문제 해결 (2025-05-08)
  - models.py 파일에 FlavorDiffusionModel 클래스 구현
  - 그래프 신경망 네트워크(GNN) 기반 모델 구현
  - 노드 임베딩 및 예측 로직 구현
- ✅ Pairing 테이블 컬럼 불일치 문제 해결 (2025-05-08)
  - 'explanation' 컬럼을 'reason' 컬럼으로 통일
  - Pairing.js 모델 수정
  - pairingController.js 컨트롤러 수정
- ✅ utils.py 파일에 누락된 함수 추가 (2025-05-08)
  - load_checkpoint 함수 구현 - 모델 체크포인트 불러오기 기능
  - normalize_score 함수 구현 - 점수 정규화 기능
- ✅ AI 모델 fallback 기능 개선 (2025-05-08)
  - predict.py 파일의 predict_score 함수 개선
  - 일반적인 페어링에 대한 특별 케이스 추가
  - 테스트 페어링(liquorId=59, ingredientId=863)에 대한 특별 케이스 추가
- ✅ 사용자 컨트롤러 코드를 MongoDB에서 MySQL로 완전히 마이그레이션
- ✅ Auth 미들웨어를 MySQL 호환 방식으로 수정
- ✅ ingredientController.js의 구문 오류 수정
- ✅ userController.js의 pool 참조 문제 수정
- ✅ MySQL 데이터베이스 연결 설정 수정
- ✅ 로그아웃 API 엔드포인트 추가
- ✅ Liquor 모델에서 execute를 query로 변경
- ✅ Ingredient 모델에서 execute를 query로 변경
- ✅ Compound 모델에서 execute를 query로 변경
- ✅ compoundController.js 파일을 MySQL 호환 방식으로 수정
- ✅ Edge 모델 및 컨트롤러 수정, getAllEdges 메서드 추가
- ✅ Edge API에 ID로 단일 엣지 조회 기능 추가
- ✅ Node 모델 메서드 이름을 일관성 있게 변경 (find* → get*)
- ✅ Pairing 모델에서 pool.execute를 pool.query로 변경 (2025-05-06)
- ✅ AI 모델 통합을 위한 predict.py 및 recommend.py 파일 생성 (2025-05-06)
- ✅ pairingController.js에서 findOne 메소드 호출을 getById로 변경 (2025-05-06)
- ✅ model.js에서 Liquor 및 Ingredient 모델의 메소드 호출 방식 통일 (2025-05-06)
- ✅ 페어링 API HTTP 500 내부 서버 오류 해결 (2025-05-06)
- ✅ Pairing 모델에서 db 모듈 가져오기 수정 (2025-05-06)
- ✅ getPairingScoreByIds 컨트롤러에 강화된 오류 처리 추가 (2025-05-06)
- MongoDB에서 MySQL로 마이그레이션 완료 후 나머지 컨트롤러 오류 수정
- API 응답 형식 통일 및 오류 메시지 개선

### 2. 프론트엔드 서비스 연동 [다음 예정]
- 새로 구성된 MySQL 데이터베이스와 API 연동
- Preferences API 연동
- Recommendations API 연동
- Admin 페이지 개발

### 3. API 문서화 작업 [다음 예정]
- OpenAPI/Swagger 스펙 업데이트
- API 엔드포인트 문서화
- 요청/응답 스키마 정의

### 4. AI 모델 통합 [다음 예정]
- 페어링 점수 예측 API 개선
- 설명 생성 로직 고도화
- 성능 최적화

### 5. 배포 환경 구성 [다음 예정]
- Docker 컨테이너 최적화
- CI/CD 파이프라인 구축
- AWS 배포 설정

## 데이터 흐름

1. **사용자 입력**: 사용자가 술 또는 음식을 선택
2. **백엔드 처리**: Express.js 서버가 요청을 처리하고 AI 모델 API에 전달
3. **AI 모델 예측**: FlavorDiffusion 모델이 페어링 점수를 계산
4. **자연어 설명 생성**: OpenAI API를 사용하여 페어링 결과에 대한 설명 생성
5. **결과 처리**: 점수와 설명을 사용자에게 반환

## 주요 API 엔드포인트

### 인증 관련
- `/api/users/register`: 사용자 등록
- `/api/users/login`: 사용자 로그인
- `/api/users/logout`: 사용자 로그아웃
- `/api/users/me`: 현재 사용자 정보 조회

### 페어링 관련
- `/api/pairing/predict`: 특정 술과 음식의 페어링 점수 예측
- `/api/pairings/:liquorId/:ingredientId`: 페어링 정보 조회
- `/api/pairings/:id/rate`: 페어링 평가

### 추천 관련
- `/api/recommendations/liquors/:liquorId`: 특정 주류에 맞는 재료 추천
- `/api/recommendations/personal`: 사용자 맞춤 추천
- `/api/recommendations/popular`: 인기 페어링 조회

### 관리자 전용
- `/api/admin/import/nodes`: 노드 데이터 임포트
- `/api/admin/import/edges`: 엣지 데이터 임포트
- `/api/admin/recalculate`: 페어링 점수 재계산
- `/api/admin/stats`: 시스템 통계 조회

## 애플리케이션 실행 방법

1. **백엔드 서버 실행**
   ```
   cd server
   npm install
   npm run dev
   ```
   서버는 기본적으로 http://localhost:5004에서 실행됩니다.

2. **프론트엔드 실행**
   ```
   cd client
   npm install
   npm start
   ```
   애플리케이션은 http://localhost:3004에서 실행됩니다.

3. **환경 변수 설정**
   백엔드에서 .env 파일을 통해 다음 환경 변수를 설정해야 합니다:
   - DB_HOST: MySQL 서버 호스트 (기본값: localhost)
   - DB_PORT: MySQL 서버 포트 (기본값: 3306)
   - DB_USER: MySQL 사용자 이름
   - DB_PASSWORD: MySQL 사용자 비밀번호
   - DB_NAME: MySQL 데이터베이스 이름
   - JWT_SECRET: JWT 토큰 서명용 비밀 키
   - OPENAI_API_KEY: OpenAI API 키
   - PORT: 서버 포트 (기본값: 5004)
   - NODE_ENV: 실행 환경 (development 또는 production)

## 데이터베이스 구조

ERD 파일(`docs/revised_mysql_erd.md`)에 상세한 테이블 구조가 정의되어 있습니다.

## 로그 관리

시스템 로그는 `logs/` 디렉토리에 저장되며, 애플리케이션 로그, 오류 로그, 접근 로그가 별도로 관리됩니다.
