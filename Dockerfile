# 1. Node.js 기본 이미지 가져오기 (v24.15.0)
FROM node:24.15.0-alpine

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 3. 패키지 목록 복사 및 설치 (빌드에 devDependencies 필요)
COPY package*.json ./
RUN npm install

# 4. 나머지 소스 코드 전부 복사
COPY . .

# 5. 프로덕션 번들: API 는 상대 경로(`/api/...`) — 브라우저는 :3000 만 호출, preview 가 백엔드로 프록시
ENV VITE_SAME_ORIGIN_API=1
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
# `npm run start` 는 package.json 과 Docker 캐시 불일치 시 실패할 수 있어 vite 를 직접 호출
CMD ["./node_modules/.bin/vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
