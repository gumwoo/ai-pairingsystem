# Vercel 환경변수 업데이트 가이드

## EC2 백엔드 연결을 위한 Vercel 설정

### 1. Vercel 대시보드 접속
- https://vercel.com/dashboard
- ai-pairingsystem 프로젝트 선택

### 2. Environment Variables 설정
Settings → Environment Variables에서 다음 변수들을 추가/수정:

```
REACT_APP_API_URL=http://15.165.17.165:5000/api
REACT_APP_ENV=production
```

### 3. 재배포 트리거
- Environment Variables 저장 후 자동으로 재배포됨
- 또는 Deployments 탭에서 수동 재배포 가능

### 4. 배포 후 확인사항
- [ ] API 연결 테스트
- [ ] CORS 정상 동작 확인
- [ ] 주요 기능 정상 작동 확인

## 대안: Git 기반 배포

### Option A: 환경변수 파일 업데이트
```bash
# 현재 .env.production 파일을 EC2용으로 변경
cp .env.production.ec2 .env.production
git add .
git commit -m "Update API URL for EC2 backend"
git push
```

### Option B: 빌드 시 환경변수 설정
Vercel 빌드 설정에서 Build Command 수정:
```bash
REACT_APP_API_URL=http://15.165.17.165:5000/api npm run build
```

## 주의사항
⚠️ EC2 서버가 실행 중이어야 API 호출이 정상 작동합니다.
⚠️ EC2 보안 그룹에서 포트 5000, 8000을 0.0.0.0/0으로 열어야 합니다.
⚠️ HTTPS/HTTP 혼용 시 브라우저에서 차단될 수 있습니다.