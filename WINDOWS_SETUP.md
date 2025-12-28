# 🪟 Windows 개발환경 세팅 가이드

> 아무것도 없는 Windows에서 터미널만으로 21Lab AI Agent 개발환경 구축하기

## 📋 설치 순서

1. Windows Terminal
2. WSL2 + Ubuntu
3. Docker Desktop
4. Git
5. Node.js (fnm)
6. pnpm
7. VS Code
8. 백엔드 실행 (Docker)
9. 프론트엔드 클론 및 실행

---

## 1️⃣ Windows Terminal 설치

PowerShell을 **관리자 권한**으로 실행 후:

```powershell
winget install Microsoft.WindowsTerminal
```

설치 후 Windows Terminal 실행

---

## 2️⃣ WSL2 + Ubuntu 설치

```powershell
# WSL 활성화 및 Ubuntu 설치 (한 번에)
wsl --install

# 재부팅 필요
shutdown /r /t 0
```

재부팅 후 Ubuntu가 자동 실행되면:
- 사용자명 입력
- 비밀번호 설정

### WSL 버전 확인

```powershell
wsl --version
```

### Ubuntu 업데이트

```bash
# Ubuntu 터미널에서
sudo apt update && sudo apt upgrade -y
```

---

## 3️⃣ Docker Desktop 설치

> 백엔드를 Docker로 실행하면 패키지 의존성 문제 없이 깔끔하게 실행 가능

### 설치

```powershell
winget install Docker.DockerDesktop
```

### 설치 후 설정

1. **재부팅** 필요
2. Docker Desktop 실행
3. Settings → Resources → WSL Integration → Ubuntu 활성화
4. Apply & Restart

### 설치 확인

```powershell
docker --version
docker-compose --version
```

### WSL에서도 확인

```bash
# WSL Ubuntu에서
docker --version
```

---

## 4️⃣ Git 설치

### Windows (PowerShell)

```powershell
winget install Git.Git
```

### WSL Ubuntu

```bash
sudo apt install git -y

# Git 설정
git config --global user.name "이름"
git config --global user.email "이메일@example.com"
```

---

## 5️⃣ Node.js 설치 (fnm 사용)

> fnm = Fast Node Manager. nvm보다 빠름

### Windows (PowerShell)

```powershell
# fnm 설치
winget install Schniz.fnm

# PowerShell 프로필에 fnm 환경변수 추가
notepad $PROFILE
```

프로필에 아래 내용 추가:
```powershell
fnm env --use-on-cd | Out-String | Invoke-Expression
```

저장 후 PowerShell 재시작, 그다음:

```powershell
# Node.js LTS 설치
fnm install --lts
fnm use lts-latest
fnm default lts-latest

# 확인
node -v
npm -v
```

### WSL Ubuntu

```bash
# fnm 설치
curl -fsSL https://fnm.vercel.app/install | bash

# 쉘 재시작 또는
source ~/.bashrc

# Node.js LTS 설치
fnm install --lts
fnm use lts-latest
fnm default lts-latest

# 확인
node -v
npm -v
```

---

## 6️⃣ pnpm 설치

### Windows (PowerShell)

```powershell
# npm으로 설치
npm install -g pnpm

# 또는 winget으로
winget install pnpm.pnpm

# 확인
pnpm -v
```

### WSL Ubuntu

```bash
npm install -g pnpm

# 확인
pnpm -v
```

---

## 7️⃣ VS Code 설치

```powershell
winget install Microsoft.VisualStudioCode
```

### 필수 확장 프로그램

VS Code 열고 `Ctrl+Shift+X`로 확장 탭 열어서 설치:

| 확장 프로그램 | 설명 |
|--------------|------|
| `Vue - Official` | Vue 3 공식 지원 |
| `TypeScript Vue Plugin (Volar)` | Vue + TS 지원 |
| `Tailwind CSS IntelliSense` | Tailwind 자동완성 |
| `ESLint` | 린팅 |
| `Prettier` | 코드 포맷팅 |
| `WSL` | WSL 연동 (Ubuntu에서 작업 시) |

### 터미널에서 확장 설치 (선택)

```powershell
code --install-extension Vue.volar
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode-remote.remote-wsl
```

---

## 8️⃣ 백엔드 실행 (Docker)

> Python 패키지 의존성 문제 없이 백엔드 서버 실행

### 백엔드 저장소 클론

```bash
# WSL Ubuntu에서
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/your-repo/21lab-backend.git
cd 21lab-backend
```

### Docker Compose로 실행

```bash
# 백엔드 폴더에서
docker-compose up -d
```

또는 Dockerfile만 있는 경우:

```bash
# 이미지 빌드
docker build -t 21lab-backend .

# 컨테이너 실행
docker run -d -p 8000:8000 --name backend 21lab-backend
```

### 실행 확인

```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs backend -f

# API 테스트
curl http://localhost:8000/health
```

### Docker 명령어 요약

```bash
# 컨테이너 중지
docker stop backend

# 컨테이너 재시작
docker restart backend

# 컨테이너 삭제
docker rm backend

# 이미지 삭제
docker rmi 21lab-backend

# 전체 정리
docker-compose down
```

### docker-compose.yml 예시

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### .env 파일 설정

```bash
# 백엔드 폴더에 .env 생성
cat > .env << 'EOF'
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-xxx
# 기타 API 키들...
EOF
```

---

## 9️⃣ 프론트엔드 클론 및 실행

> 프론트엔드는 HMR이 빠른 로컬 개발 권장

### Windows에서 작업하는 경우

```powershell
# 원하는 디렉토리로 이동
cd C:\Users\사용자명\Projects

# 클론
git clone https://github.com/your-repo/21lab-ai-agent.git
cd 21lab-ai-agent

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### WSL Ubuntu에서 작업하는 경우 (권장)

```bash
# 홈 디렉토리에 프로젝트 폴더 생성
mkdir -p ~/projects && cd ~/projects

# 클론
git clone https://github.com/your-repo/21lab-ai-agent.git
cd 21lab-ai-agent

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### VS Code로 프로젝트 열기

```bash
# 프로젝트 폴더에서
code .
```

WSL에서 실행 시 자동으로 Remote - WSL 모드로 열림

---

## 🔧 추가 설정 (선택)

### Windows Terminal 기본 쉘 변경

Settings (`Ctrl+,`) → Startup → Default profile → Ubuntu 선택

### WSL에서 Windows 파일 접근

```bash
# Windows C드라이브
cd /mnt/c/Users/사용자명/

# Windows 탐색기에서 현재 폴더 열기
explorer.exe .
```

### SSH 키 생성 (GitHub용)

```bash
ssh-keygen -t ed25519 -C "이메일@example.com"

# 키 복사
cat ~/.ssh/id_ed25519.pub
```

GitHub → Settings → SSH Keys에 추가

---

## 🚀 개발 명령어 요약

```bash
# 개발 서버
pnpm dev

# 타입 체크
pnpm typecheck

# 프로덕션 빌드
pnpm build

# 빌드 프리뷰
pnpm preview
```

---

## ❓ 트러블슈팅

### `pnpm: command not found`

```bash
# npm 전역 경로 확인
npm config get prefix

# 해당 경로가 PATH에 있는지 확인
echo $PATH
```

### WSL에서 `code .` 안 될 때

```bash
# VS Code가 PATH에 없으면
export PATH="$PATH:/mnt/c/Users/사용자명/AppData/Local/Programs/Microsoft VS Code/bin"
```

### Node.js 버전 문제

```bash
# 프로젝트 권장 버전으로 설치
fnm install 20
fnm use 20
```

### 포트 충돌

```powershell
# Windows에서 포트 사용 프로세스 확인
netstat -ano | findstr :5173

# 프로세스 종료
taskkill /PID <PID> /F
```

---

## 📁 최종 디렉토리 구조

```
# Windows
C:\Users\사용자명\Projects\21lab-ai-agent\

# WSL Ubuntu (권장)
~/projects/21lab-ai-agent/
```

---

**완료!** `pnpm dev` 실행 후 http://localhost:5173 접속
