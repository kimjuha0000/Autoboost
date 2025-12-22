# Autoboost 배포 안내서 (Netlify & Vercel)

이 문서는 "Autoboost" 프로젝트를 **Netlify**와 **Vercel** 두 가지 플랫폼에 배포하는 방법을 안내합니다. 우리 프로젝트는 React 프론트엔드와 Express.js 백엔드로 구성된 모노레포 구조이므로, 각 플랫폼의 특성에 맞춰 배포 전략을 수립합니다.

---

## 1. 프로젝트 준비 (Git 저장소)

모든 배포는 Git 저장소(예: GitHub)를 통해 이루어집니다.

1.  **Git 저장소 생성**: [GitHub](https://github.com/new)에서 새로운 저장소를 생성합니다. (비공개 또는 공개)
2.  **로컬 프로젝트와 Git 연결**: 터미널에서 프로젝트 최상위 폴더(`Autoboost`) 안에서 아래 명령어를 실행합니다.

    ```bash
    # Git 로컬 저장소 초기화 (이미 .git 폴더가 있다면 이 단계는 건너세요)
    git init

    # 원격 저장소 주소 추가 (URL은 본인 저장소 주소로 변경)
    git remote add origin https://github.com/YourUsername/YourRepoName.git

    # 변경 사항 추적 무시 설정 (data/ 폴더는 저장소에 포함되지 않도록 .gitignore 확인)
    # .gitignore 파일에 다음 내용이 있는지 확인합니다:
    # /data
    # /frontend/node_modules
    # /backend/node_modules

    # 모든 파일을 Git에 추가
    git add .

    # 첫 번째 커밋 생성
    git commit -m "Initial project setup with universal frontend and backend"

    # main 브랜치로 코드 푸시
    git push -u origin main
    ```

---

## 2. Netlify 배포 (프론트엔드 + 서버리스 백엔드)

Netlify는 React 프론트엔드를 호스팅하고, Express.js 백엔드를 **Netlify Functions**로 자동 변환하여 배포합니다.

### 2.1. Netlify 프로젝트 설정

1.  **Netlify 로그인**: [Netlify 웹사이트](https://app.netlify.com/)에 접속하여 GitHub 계정으로 로그인(가입)합니다.
2.  **새 사이트 생성**:
    *   대시보드에서 **Add new site -> Import an existing project**를 클릭합니다.
    *   **Deploy with Git** 섹션에서 GitHub을 선택하고, 앞서 준비한 Git 저장소를 연결합니다.
3.  **사이트 설정**:
    *   **Owner**: 본인의 GitHub 계정 또는 조직
    *   **Branch to deploy**: `main` (기본 브랜치)
    *   **Base directory**: 비워둠 (프로젝트 루트가 기본 경로이므로)
    *   **Build command**: `cd frontend && npm install && npm run build` (프론트엔드 빌드)
    *   **Publish directory**: `frontend/dist` (프론트엔드 빌드 결과물 경로)
    *   **Functions directory**: `netlify/functions` (서버리스 함수 코드 경로, `netlify.toml`에 정의됨)
4.  **환경 변수 설정 (선택 사항)**: 필요한 경우, `Environment variables` 섹션에서 `NODE_VERSION` 등을 설정할 수 있습니다.
5.  **Deploy site**를 클릭하여 배포를 시작합니다.

### 2.2. 배포 확인

*   배포가 완료되면 Netlify가 제공하는 URL을 통해 프론트엔드 앱에 접속할 수 있습니다.
*   백엔드 API는 `/.netlify/functions/server/api/qr?id=[qrId]` 와 `/.netlify/functions/server/api/events` 형태로 접근 가능합니다.

---

## 3. Vercel 배포 (프론트엔드 + 서버리스 백엔드)

Vercel은 React 프론트엔드를 호스팅하고, Express.js 백엔드를 **Vercel Serverless Functions**로 자동 변환하여 배포합니다.

### 3.1. Vercel 프로젝트 설정

1.  **Vercel 로그인**: [Vercel 웹사이트](https://vercel.com/)에 접속하여 GitHub 계정으로 로그인(가입)합니다.
2.  **새 프로젝트 생성**:
    *   대시보드에서 **Add New... -> Project**를 클릭합니다.
    *   **Import Git Repository** 섹션에서 앞서 준비한 Git 저장소를 연결합니다.
3.  **프로젝트 설정**:
    *   **Root Directory**: `/` (프로젝트 최상위)
    *   **Framework Preset**: `Vite` (프론트엔드를 Vite로 빌드하기 위함)
    *   **Build & Output Settings**:
        *   **Build Command**: `cd frontend && npm install && npm run build`
        *   **Output Directory**: `frontend/dist`
    *   **Serverless Function Settings**: Vercel은 `backend/src/app.js`와 `netlify/functions/server.js`를 자동으로 서버리스 함수로 감지할 수 있습니다.
        *   `backend/src/app.js`를 Vercel 함수로 명시하려면, 프로젝트 루트에 `vercel.json` 파일을 생성하여 라우팅 규칙을 정의할 수 있습니다. (아래 예시 참조)

### 3.2. Vercel.json 설정 예시 (선택 사항)

프로젝트 루트에 `vercel.json` 파일을 만들어 API 라우팅을 명시적으로 설정할 수 있습니다.

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/backend/src/app.js" }
  ],
  "functions": {
    "backend/src/app.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```
*주의: `functions` 설정은 Vercel이 해당 파일을 서버리스 함수로 인식하게 합니다. 이 경우 `backend/src/app.js`에 모든 API 로직이 포함되어야 하며, Netlify Functions 래퍼는 Vercel 배포 시에는 필요하지 않습니다.*

### 3.3. 배포 확인

*   배포가 완료되면 Vercel이 제공하는 URL을 통해 프론트엔드 앱에 접속할 수 있습니다.
*   백엔드 API는 `https://[앱도메인]/api/qr?id=[qrId]` 와 `https://[앱도메인]/api/events` 형태로 접근 가능합니다. (`vercel.json` 설정에 따라 달라질 수 있습니다.)

---

## 4. 데이터 지속성 고려 사항

*   현재 `data/events.json` 파일은 배포될 때 함께 업로드됩니다. 하지만 서버리스 함수는 **stateless(무상태)**합니다. 즉, 함수가 실행될 때마다 새로운 환경에서 시작되므로, `data/events.json`에 기록된 내용은 함수 실행 사이에 **유지되지 않습니다.**
*   진정한 데이터 지속성을 위해서는 Amazon S3, Azure Blob Storage, Google Cloud Storage와 같은 **클라우드 스토리지**나 MongoDB Atlas, PostgreSQL, PlanetScale과 같은 **데이터베이스 서비스**를 사용해야 합니다.
*   **프로토타입 단계에서는 `data/events.json` 방식도 로컬 테스트에는 유용하지만, 배포 시에는 위와 같은 외부 데이터베이스 연동이 필수적입니다.**
