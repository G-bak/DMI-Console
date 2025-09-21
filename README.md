# 📁 프로젝트명: DMI Console

## 📝 설명  
이 프로젝트는 DMI 작업표준서 호기 분류 및 관리 콘솔 웹 프로젝트입니다.  
SVG 기반 도면에서 각 호기(R-1 ~ R-45)를 선택하면 해당 작업표준서 페이지로 이동하며,  
Express.js 서버를 통해 정적 리소스를 제공하고 실시간 관리 기능을 연동할 수 있습니다.  



## 📁 디렉토리 구조
```pgsql
.
├── assets/
│   ├── css/
│   │   ├── custom.css
│   │   └── styles.css
│   ├── images/
│   │   ├── favicons/
│   │   ├── logo/
│   │   ├── products/
│   │   └── work_standards/
│   └── js/
│       ├── equipment-navigator.js
│       ├── web-socket.js
│       └── work-standards.js
├── node_modules/
├── index.html
├── work-standards.html
├── server.js
├── package.json
├── package-lock.json
├── requirements.txt
└── README.md
```



## 📦 주요 기능
1. ✅ 호기별 작업표준서 페이지 이동  
   - SVG 도면 클릭 → R-호기 페이지 자동 라우팅  
   - 숫자 입력 게이트(R-1 ~ R-45) 기능  

2. 🔑 관리자 게이트  
   - 접속 시 `admin` 비밀번호 입력 → 콘솔 메인(index.html) 접근 허용  
   - 호기 번호 입력 시 해당 작업표준서 페이지 자동 이동  

3. 📡 실시간 웹소켓 연동 (준비됨)  
   - 다른 PC에서 접속 시 작업표준서 변경 사항 자동 반영  

4. 🎨 정적 리소스 관리  
   - `assets/css` → 사용자 정의 스타일  
   - `assets/js` → 네비게이터, 웹소켓, 작업표준서 로직 분리  
   - `assets/images` → 로고, 제품 이미지, 작업표준서 이미지 관리  

5. ⚙️ Express 서버 실행  
   - `server.js`에서 정적 파일 서빙 및 라우팅  
   - `npm start`로 서버 구동  



## 🧪 실행 및 테스트 절차

### 1. Node.js 설치
```powershell
winget install OpenJS.NodeJS.LTS
node -v
npm -v
```

### 2. 프로젝트 클론
```powershell
git clone https://github.com/G-bak/DMI-Console.git
cd dmi-console
```

### 3. 의존성 설치
```powershell
npm install
```

### 4. 서버 실행
```powershell
npm install
```

### 5. 브라우저 접속
```cpp
http://127.0.0.1:5500/
```



## ⚙️ 기술 스택
- 백엔드: Node.js + Express.js
- 프론트엔드: HTML5 + CSS3 + JavaScript (Vanilla, SVG 기반)



## 📌 개발/테스트 환경
- OS: Windows 11
- Node.js LTS (권장)
- npm 기반 의존성 관리



## 📎 GitHub
- https://github.com/G-bak/DMI-Console.git



## 🔒 참고 사항
- admin 인증 시 index.html 접근 가능
- 호기 번호 입력 시 세션 동안 해당 호기로 자동 라우팅
- WebSocket 연동 시 다른 클라이언트 PC에서도 작업표준서 변경 실시간 반영 가능



## ✍ 작성자
- 최재빈