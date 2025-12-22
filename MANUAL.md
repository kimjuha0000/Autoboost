# Autoboost 상세 매뉴얼

이 문서는 "Autoboost" 프로젝트의 구조, 실행 방법, 핵심 기능의 작동 방식, 그리고 배포 방법에 대해 상세히 설명합니다.

---

### 1. 프로젝트 구조

우리 프로젝트는 **프론트엔드(React)**와 **백엔드(Express.js)**가 분리된 모노레포(Monorepo) 구조를 가집니다.

```
Autoboost/
├── frontend/           # 사용자 화면(UI)을 담당하는 React(Vite) 프로젝트
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/            # 백엔드 API 로직(Express.js)을 담는 Node.js 프로젝트
│   ├── src/
│   ├── package.json
│   └── ...
├── data/               # 모든 스캔 기록이 저장되는 JSON 데이터베이스 폴더 (events.json)
├── netlify/            # Netlify 배포 시 백엔드 Express 앱을 서버리스 함수로 변환하는 설정 및 래퍼
│   ├── functions/      # Express 앱을 래핑하는 Netlify Functions 코드
│   └── ...
├── ARCHITECTURE.md     # 아키텍처 설계 배경 문서
├── MANUAL.md           # 현재 보고 계신 상세 매뉴얼
└── netlify.toml        # Netlify 배포 및 빌드 설정 파일
```

-   **`frontend/`**: Vite로 만들어진 React 프로젝트입니다. '사장님 대시보드'의 모든 UI 컴포넌트와 화면 로직이 이곳에 들어갑니다.
-   **`backend/`**: Node.js Express.js 애플리케이션입니다. QR 스캔을 기록하고, 대시보드에 데이터를 제공하는 API 로직이 이곳에 구현됩니다.
-   **`data/`**: `.gitignore`에 추가되어 Git 저장소에는 포함되지 않으며, 실제 스캔 기록 데이터(`events.json`)를 담는 폴더입니다.
-   **`netlify/functions/`**: Netlify Functions는 Node.js Express 앱을 서버리스 환경에서 실행하기 위한 래퍼(Wrapper) 코드를 포함합니다.
-   **`netlify.toml`**: Netlify가 우리 프로젝트를 어떻게 빌드하고, 백엔드 함수를 어디서 찾아야 하는지 알려주는 중요한 설정 파일입니다. Vercel 배포 시에는 사용되지 않습니다.

### 2. 로컬 환경에서 실행하는 방법

로컬에서 프론트엔드 앱과 백엔드 API(Netlify Functions로 에뮬레이션)를 함께 실행하려면 [`netlify-cli`](https://docs.netlify.com/cli/get-started/)가 필요합니다. 이미 글로벌로 설치되었습니다.

1.  **프로젝트 루트로 이동**: 터미널에서 프로젝트의 최상위 폴더(`Autoboost`)로 이동합니다.
    ```bash
    cd Desktop/juhakim/Autoboost
    ```
2.  **모든 의존성 설치**: `frontend`와 `backend` 폴더 모두에 의존성을 설치합니다.
    ```bash
    cd frontend
    npm install
    cd ../backend
    npm install
    cd .. # 프로젝트 루트로 다시 이동
    ```
3.  **Netlify 개발 서버 실행**: 프로젝트 루트에서 `netlify dev` 명령을 실행합니다.
    ```bash
    netlify dev
    ```
    이 명령은 `frontend` 앱을 개발 모드로 실행하고, `backend` Express 앱을 `netlify/functions/server.js` 래퍼를 통해 서버리스 함수처럼 실행합니다. Netlify CLI는 프록시 역할을 하여 `/api/*`로 들어오는 요청을 자동으로 백엔드 API로 라우팅합니다.

4.  **앱 접속**: 보통 `http://localhost:8888` 로 앱이 실행됩니다. (정확한 주소는 `netlify dev` 실행 시 터미널에 표시됩니다.)
    *   **대시보드**: `http://localhost:8888` 에 접속하여 사장님 대시보드를 확인합니다.
    *   **QR 스캔 테스트**: `http://localhost:8888/.netlify/functions/server/api/qr?id=test-qr-id` 와 같은 URL로 접속하여 QR 스캔을 시뮬레이션할 수 있습니다. (URL 마지막의 `test-qr-id` 부분은 원하는 QR ID로 변경 가능). 이 URL에 접속하면 네이버로 리다이렉트되고, 대시보드에서 스캔 기록을 확인할 수 있습니다.
        *주의*: `/.netlify/functions/server` 경로가 포함되어야 로컬 Netlify CLI가 Express 앱으로 요청을 라우팅할 수 있습니다.

### 3. 핵심 기능 작동 방식

#### 3.1. QR 코드 스캔 및 데이터 기록 흐름

1.  **QR 코드 생성**: 각 매장 위치(예: 테이블 번호)에 고유한 `qrId`를 가진 QR 코드를 생성합니다. 이 QR 코드는 `https://[앱도메인]/.netlify/functions/server/api/qr?id=[qrId]` (또는 Vercel 배포 시 `https://[앱도메인]/api/qr?id=[qrId]`) 형태의 URL을 가리킵니다.
2.  **고객 스캔**: 고객이 이 QR 코드를 스캔합니다.
3.  **API 호출**: 스캔된 URL은 백엔드(Express.js 앱)의 `/api/qr` 엔드포인트를 호출합니다.
4.  **정보 수집**: 백엔드는 호출 시점의 `qrId`, 고객의 IP 주소, User-Agent(기기 정보) 및 타임스탬프를 수집합니다.
5.  **어뷰징 방지**: 수집된 IP와 `qrId`를 기반으로, 동일한 스캔이 24시간 이내에 발생했는지 확인하여 중복 기록을 방지합니다.
6.  **데이터 기록**: 중복이 아니면, 스캔 정보를 `data/events.json` 파일에 새로운 항목으로 추가합니다.
7.  **리다이렉트**: 데이터 기록 후, 고객을 미리 설정된 목적지 URL(예: 네이버 플레이스 리뷰 페이지)로 리다이렉트 시킵니다.

#### 3.2. 대시보드 데이터 조회 흐름

1.  **대시보드 접속**: 사장님이 웹 브라우저를 통해 프론트엔드 앱의 대시보드 URL에 접속합니다.
2.  **데이터 요청**: React 앱의 대시보드 컴포넌트는 백엔드 API의 `/api/events` 엔드포인트로 스캔 기록 데이터 요청을 보냅니다.
3.  **데이터 응답**: 백엔드는 `data/events.json` 파일에서 모든 스캔 기록을 읽어 JSON 형태로 프론트엔드에 응답합니다.
4.  **데이터 표시**: React 앱은 전달받은 JSON 데이터를 파싱하여 'QR 스캔 기록' 표에 최신 스캔부터 순서대로 표시합니다. '총 QR 스캔 수', '이번 달 스캔 수'와 같은 KPI도 함께 업데이트하여 보여줍니다.

### 4. Netlify 및 Vercel 배포 방법

*(모든 개발이 완료된 후 최종 배포 방법이 여기에 추가됩니다.)*
